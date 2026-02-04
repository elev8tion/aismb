// Safe MediaRecorder wrapper with error handling and cleanup

import { getBrowserAudioFormat, PermissionDeniedError } from './browserCompatibility';

export interface RecordingResult {
  audioBlob: Blob;
  mimeType: string;
}

export interface MediaRecorderOptions {
  maxDurationMs?: number;
  onDataAvailable?: (chunk: Blob) => void;
  onError?: (error: Error) => void;
}

/**
 * Creates and manages a MediaRecorder with proper error handling
 */
export class SafeMediaRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private mediaStream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private mimeType: string;
  private onErrorCallback?: (error: Error) => void;

  constructor(options: MediaRecorderOptions = {}) {
    this.onErrorCallback = options.onError;

    // Detect browser-compatible format
    const format = getBrowserAudioFormat();
    this.mimeType = format.mimeType;
  }

  /**
   * Starts recording from the user's microphone
   * @throws PermissionDeniedError if microphone access is denied
   */
  async start(): Promise<void> {
    try {
      // Request microphone access
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        },
      });

      // Create MediaRecorder with detected format
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType: this.mimeType,
      });

      // Setup event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        const error = new Error(`MediaRecorder error: ${event}`);
        console.error('MediaRecorder error:', error);
        this.handleError(error);
      };

      // Start recording with timeslice parameter
      // Safari requires timeslice (1000ms) for Whisper API to properly transcribe
      // Without this, Safari creates audio blobs with metadata issues that cause
      // Whisper to only transcribe the first 1-3 seconds
      // See: https://community.openai.com/t/whisper-problem-with-audio-mp4-blobs-from-safari/322252
      this.mediaRecorder.start(1000);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          throw new PermissionDeniedError('Microphone access denied by user');
        }
        throw error;
      }
      throw new Error('Unknown error starting recording');
    }
  }

  /**
   * Stops recording and returns the audio blob
   * @returns Promise that resolves with recording result
   */
  async stop(): Promise<RecordingResult> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'));
        return;
      }

      if (this.mediaRecorder.state === 'inactive') {
        reject(new Error('MediaRecorder is not recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        try {
          const audioBlob = new Blob(this.chunks, { type: this.mimeType });
          this.cleanup();
          resolve({
            audioBlob,
            mimeType: this.mimeType,
          });
        } catch (error) {
          this.cleanup();
          reject(error);
        }
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Gets the current recording state
   */
  getState(): RecordingState {
    if (!this.mediaRecorder) {
      return 'inactive';
    }
    return this.mediaRecorder.state;
  }

  /**
   * Cleans up resources
   */
  private cleanup(): void {
    // Stop all media stream tracks
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => {
        track.stop();
      });
      this.mediaStream = null;
    }

    // Clear chunks
    this.chunks = [];

    // Clear MediaRecorder reference
    this.mediaRecorder = null;
  }

  /**
   * Handles errors and calls callback if provided
   */
  private handleError(error: Error): void {
    this.cleanup();
    if (this.onErrorCallback) {
      this.onErrorCallback(error);
    }
  }

  /**
   * Cancels recording and cleans up without returning result
   */
  cancel(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    this.cleanup();
  }
}

export type RecordingState = 'inactive' | 'recording' | 'paused';
