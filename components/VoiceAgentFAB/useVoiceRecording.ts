// Custom hook for voice recording with proper cleanup and error handling

import { useState, useRef, useCallback, useEffect } from 'react';
import { SafeMediaRecorder } from './utils/mediaRecorder';
import {
  NetworkError,
  ValidationError,
  UserCancelledError,
  checkBrowserCompatibility,
} from './utils/browserCompatibility';
import { AudioURLManager, isValidAudioBlob } from './utils/audioProcessor';

export interface VoiceRecordingOptions {
  onTranscription?: (text: string) => void;
  onError?: (error: Error) => void;
  maxDurationMs?: number;
  language?: 'en' | 'es';
}

export interface VoiceRecordingState {
  isRecording: boolean;
  error: Error | null;
  isProcessing: boolean;
}

export function useVoiceRecording(options: VoiceRecordingOptions = {}) {
  const {
    onTranscription,
    onError,
    maxDurationMs = 60000, // 60 seconds default
    language,
  } = options;

  // State
  const [state, setState] = useState<VoiceRecordingState>({
    isRecording: false,
    error: null,
    isProcessing: false,
  });

  // Refs for cleanup
  const abortControllerRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mediaRecorderRef = useRef<SafeMediaRecorder | null>(null);
  const isRecordingRef = useRef(false);
  const audioURLManagerRef = useRef<AudioURLManager>(new AudioURLManager());

  // Use ref to always get latest language value (avoids stale closure issues)
  const languageRef = useRef(language);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  /**
   * Comprehensive cleanup function
   */
  const cleanup = useCallback(() => {
    // Abort pending network requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Cancel and cleanup media recorder
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.cancel();
      mediaRecorderRef.current = null;
    }

    // Revoke all audio URLs
    audioURLManagerRef.current.revokeAll();

    // Reset recording flag
    isRecordingRef.current = false;
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  /**
   * Handles errors and updates state
   */
  const handleError = useCallback(
    (error: Error) => {
      setState((prev) => ({
        ...prev,
        error,
        isRecording: false,
        isProcessing: false,
      }));

      if (onError) {
        onError(error);
      }

      cleanup();
    },
    [onError, cleanup]
  );

  /**
   * Sends audio to API for transcription
   */
  const sendToAPI = useCallback(
    async (audioBlob: Blob, mimeType: string): Promise<void> => {
      // Validate audio blob
      if (!isValidAudioBlob(audioBlob)) {
        throw new ValidationError('Invalid audio data');
      }

      // Create abort controller for this request
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      try {
        // Prepare form data with proper File object to preserve MIME type on iOS Safari
        const formData = new FormData();
        const extension = mimeType.split('/')[1].split(';')[0]; // Extract extension without codecs
        const file = new File([audioBlob], `recording.${extension}`, { type: mimeType });
        formData.append('audio', file);
        const currentLanguage = languageRef.current;
        console.log(`🌐 sendToAPI called with language: ${currentLanguage}`);
        if (currentLanguage) {
          formData.append('language', currentLanguage);
        }

        // Send to API for transcription
        const response = await fetch('/api/voice-agent/transcribe', {
          method: 'POST',
          body: formData,
          signal: abortController.signal,
        });

        // Check for network errors - include detailed error from API
        if (!response.ok) {
          let errorDetail = '';
          try {
            const errorData = await response.json() as { error?: string; details?: string };
            errorDetail = errorData.details || errorData.error || response.statusText;
          } catch {
            errorDetail = response.statusText;
          }
          throw new NetworkError(`Transcribe failed (${response.status}): ${errorDetail}`);
        }

        // Parse response
        const data = await response.json() as { text?: string };

        // Validate response structure
        if (!data || typeof data.text !== 'string') {
          throw new ValidationError('Invalid API response format');
        }

        // Call success callback
        if (onTranscription) {
          onTranscription(data.text);
        }

        // Update state to success
        setState((prev) => ({
          ...prev,
          isProcessing: false,
          error: null,
        }));
      } catch (error) {
        // Handle abort
        if (error instanceof Error && error.name === 'AbortError') {
          throw new UserCancelledError('Request cancelled by user');
        }

        // Handle network errors
        if (error instanceof TypeError) {
          throw new NetworkError('Network request failed. Please check your connection.');
        }

        // Re-throw other errors
        throw error;
      } finally {
        // Clean up abort controller
        abortControllerRef.current = null;
      }
    },
    [onTranscription]
  );

  /**
   * Starts recording
   */
  const startRecording = useCallback(async () => {
    // Guard: Prevent concurrent recordings
    if (isRecordingRef.current) {
      console.warn('Recording already in progress');
      return;
    }

    try {
      // Check browser compatibility
      checkBrowserCompatibility();

      // Set recording flag immediately
      isRecordingRef.current = true;

      // Update state
      setState({
        isRecording: true,
        error: null,
        isProcessing: false,
      });

      // Create media recorder
      const recorder = new SafeMediaRecorder({
        maxDurationMs,
        onError: handleError,
      });
      mediaRecorderRef.current = recorder;

      // Start recording
      await recorder.start();

      // Set timeout for max duration
      timeoutRef.current = setTimeout(() => {
        console.log('Max recording duration reached, stopping automatically');
        stopRecording();
      }, maxDurationMs);
    } catch (error) {
      isRecordingRef.current = false;
      handleError(error instanceof Error ? error : new Error('Failed to start recording'));
    }
  }, [maxDurationMs, handleError]);

  /**
   * Stops recording and sends to API
   */
  const stopRecording = useCallback(async () => {
    // Guard: Not recording
    if (!isRecordingRef.current || !mediaRecorderRef.current) {
      console.warn('Not currently recording');
      return;
    }

    // Clear timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    try {
      // Update state to processing
      setState((prev) => ({
        ...prev,
        isRecording: false,
        isProcessing: true,
      }));

      // Stop recording and get result
      const { audioBlob, mimeType } = await mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
      isRecordingRef.current = false;

      // Send to API
      await sendToAPI(audioBlob, mimeType);
    } catch (error) {
      handleError(error instanceof Error ? error : new Error('Failed to stop recording'));
    }
  }, [sendToAPI, handleError]);

  /**
   * Cancels recording without processing
   */
  const cancelRecording = useCallback(() => {
    if (isRecordingRef.current) {
      cleanup();
      setState({
        isRecording: false,
        error: null,
        isProcessing: false,
      });
    }
  }, [cleanup]);

  return {
    ...state,
    startRecording,
    stopRecording,
    cancelRecording,
  };
}
