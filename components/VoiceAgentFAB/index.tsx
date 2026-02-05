'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidMorphLogo from '../LiquidMorphLogo';
import { useVoiceRecording } from './useVoiceRecording';
import {
  checkBrowserCompatibility,
  getErrorMessage,
  BrowserNotSupportedError,
} from './utils/browserCompatibility';
import { AudioURLManager } from './utils/audioProcessor';
import { getIOSAudioPlayer } from './utils/iosAudioUnlock';
import { getSessionId, clearSessionId } from '@/lib/utils/sessionId';
import { useTranslations } from '@/contexts/LanguageContext';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export default function VoiceAgentFAB() {
  const { t, language } = useTranslations();
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [displayError, setDisplayError] = useState<string | null>(null);
  const [browserSupported, setBrowserSupported] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showAutoClosePrompt, setShowAutoClosePrompt] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const audioURLManagerRef = useRef<AudioURLManager>(new AudioURLManager());
  const abortControllerRef = useRef<AbortController | null>(null);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const iosAudioPlayerRef = useRef(getIOSAudioPlayer());

  // Check browser compatibility on mount
  useEffect(() => {
    try {
      checkBrowserCompatibility();
      setBrowserSupported(true);
    } catch (error) {
      setBrowserSupported(false);
      if (error instanceof BrowserNotSupportedError) {
        setDisplayError(error.message);
      } else {
        setDisplayError(t.voiceAgent.errors.notSupported);
      }
    }
  }, [t.voiceAgent.errors.notSupported]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioURLManagerRef.current.revokeAll();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
      iosAudioPlayerRef.current.stop();
    };
  }, []);

  // Start auto-close countdown (30 seconds to give customer time to absorb)
  const startAutoCloseCountdown = useCallback(() => {
    setCountdown(30); // Increased from 15 to 30 seconds
    setShowAutoClosePrompt(true);

    countdownTimerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev === null || prev <= 1) {
          // Countdown finished, close the modal
          clearInterval(countdownTimerRef.current!);
          countdownTimerRef.current = null;
          setIsOpen(false);
          setVoiceState('idle');
          setTranscript('');
          setDisplayError(null);
          setShowAutoClosePrompt(false);
          setCountdown(null);
          clearSessionId(); // Clear session when auto-closing
          setSessionId(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Clear auto-close countdown
  const clearAutoCloseCountdown = useCallback(() => {
    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    setCountdown(null);
    setShowAutoClosePrompt(false);
  }, []);

  // Process full voice interaction flow
  const processVoiceInteraction = useCallback(async (transcribedText: string) => {
    setTranscript(transcribedText);
    setVoiceState('processing');

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      // Ensure we have a session ID
      const currentSessionId = sessionId || getSessionId();
      if (!sessionId) {
        setSessionId(currentSessionId);
      }

      // Step 1: Get response from chat API (with session ID for KV storage)
      const response = await fetch('/api/voice-agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: transcribedText,
          sessionId: currentSessionId, // Send session ID instead of full history
          language,
        }),
        signal: abortController.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({})) as { error?: string };
        throw new Error(`Failed to get response: ${errorData.error || 'Unknown error'}`);
      }

      const data = await response.json() as { response: string };
      let responseText = data.response;

      // Check for action tags
      const actionMatch = responseText.match(/\[ACTION:([A-Z_]+)\]/);
      if (actionMatch) {
        const action = actionMatch[1];
        responseText = responseText.replace(actionMatch[0], '').trim();

        // Execute action (scroll to section)
        let targetId = '';
        switch (action) {
          case 'SCROLL_TO_PRICING':
            targetId = 'pricing';
            break;
          case 'SCROLL_TO_ROI':
            targetId = 'roi-calculator';
            break;
          case 'SCROLL_TO_CASES':
            targetId = 'case-studies';
            break;
          case 'SCROLL_TO_PROCESS':
            targetId = 'how-it-works';
            break;
          case 'SCROLL_TO_BOOKING':
            targetId = 'get-started'; // Updated to match FinalCTA section ID
            break;
        }

        if (targetId) {
          setTimeout(() => {
            const element = document.getElementById(targetId);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }, 500); // Small delay to allow voice to start
        }
      }

      // Step 2: Convert response to speech
      setVoiceState('speaking');

      const speechResponse = await fetch('/api/voice-agent/speak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: responseText, language }),
        signal: abortController.signal,
      });

      if (!speechResponse.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await speechResponse.blob();
      const audioUrl = audioURLManagerRef.current.createURL(audioBlob);

      // Use iOS-compatible audio player (pre-unlocked during user interaction)
      await iosAudioPlayerRef.current.play(
        audioUrl,
        () => {
          // onEnded
          setVoiceState('idle');
          audioURLManagerRef.current.revokeURL(audioUrl);
          startAutoCloseCountdown();
        },
        (error) => {
          // onError
          console.error('Audio playback error:', error);
          setDisplayError(`Audio error: ${error.message}`);
          setVoiceState('idle');
          audioURLManagerRef.current.revokeURL(audioUrl);
        }
      );
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled - silent return
        setVoiceState('idle');
        return;
      }

      console.error('Voice interaction error:', error);
      // Show detailed error for debugging
      const errorMessage = error instanceof Error ? error.message : String(error);
      setDisplayError(`Error: ${errorMessage}`);
      setVoiceState('idle');
    } finally {
      abortControllerRef.current = null;
    }
  }, [sessionId, startAutoCloseCountdown, language]);

  // Handle transcription from recording hook
  const handleTranscription = useCallback(
    async (text: string) => {
      await processVoiceInteraction(text);
    },
    [processVoiceInteraction]
  );

  // Handle recording errors
  const handleRecordingError = useCallback((error: Error) => {
    const message = getErrorMessage(error);
    if (message) {
      setDisplayError(message);
    }
    setVoiceState('idle');
  }, []);

  // Use voice recording hook
  const { isRecording, isProcessing, error, startRecording, stopRecording, cancelRecording } =
    useVoiceRecording({
      onTranscription: handleTranscription,
      onError: handleRecordingError,
      maxDurationMs: 60000,
      language,
    });

  // Sync voice state with recording state
  useEffect(() => {
    if (isRecording) {
      setVoiceState('listening');
    } else if (isProcessing) {
      setVoiceState('processing');
    }
  }, [isRecording, isProcessing]);

  // Display hook errors
  useEffect(() => {
    if (error) {
      const message = getErrorMessage(error);
      if (message) {
        setDisplayError(message);
      }
    }
  }, [error]);

  const handleFABClick = () => {
    // Don't allow interaction if browser not supported
    if (!browserSupported) {
      return;
    }

    // Clear any auto-close countdown when user interacts
    clearAutoCloseCountdown();

    if (!isOpen) {
      setIsOpen(true);
      setDisplayError(null);
      setTranscript('');
      setTimeout(() => {
        startRecording();
      }, 500); // Small delay for animation
    } else {
      if (voiceState === 'listening') {
        // CRITICAL: Unlock iOS audio during user tap BEFORE async operations
        // This allows audio.play() to work after API calls complete
        iosAudioPlayerRef.current.unlock();
        stopRecording();
      } else {
        // Cancel any ongoing operations
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        cancelRecording();
        setIsOpen(false);
        setVoiceState('idle');
        setTranscript('');
        setDisplayError(null);
        clearSessionId(); // Clear session on manual close
        setSessionId(null);
      }
    }
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        onClick={handleFABClick}
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: browserSupported ? 1.05 : 1 }}
        whileTap={{ scale: browserSupported ? 0.95 : 1 }}
        disabled={!browserSupported}
        style={{
          width: isOpen ? 100 : 100,
          height: isOpen ? 100 : 100,
          opacity: browserSupported ? 1 : 0.5,
          cursor: browserSupported ? 'pointer' : 'not-allowed',
        }}
      >
        <div className="relative w-full h-full">
          {!isOpen ? (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              className="glass rounded-full p-3 shadow-2xl"
              style={{
                background: 'rgba(14, 165, 233, 0.1)',
                backdropFilter: 'blur(24px)',
                border: '2px solid rgba(14, 165, 233, 0.3)',
              }}
            >
              <LiquidMorphLogo
                src="/logos/dark_mode_brand.svg"
                alt="Voice Assistant"
                width={80}
                height={80}
                className="w-full h-full"
              />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-full p-4 shadow-2xl"
              style={{
                background: voiceState === 'listening'
                  ? 'rgba(34, 197, 94, 0.15)'
                  : voiceState === 'speaking'
                  ? 'rgba(14, 165, 233, 0.15)'
                  : 'rgba(249, 115, 22, 0.15)',
                backdropFilter: 'blur(24px)',
                border: `2px solid ${
                  voiceState === 'listening'
                    ? 'rgba(34, 197, 94, 0.4)'
                    : voiceState === 'speaking'
                    ? 'rgba(14, 165, 233, 0.4)'
                    : 'rgba(249, 115, 22, 0.4)'
                }`,
              }}
            >
              {voiceState === 'listening' && (
                <svg className="w-full h-full text-[#22C55E]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              )}
              {voiceState === 'processing' && (
                <motion.svg
                  className="w-full h-full text-[#F97316]"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" opacity="0.3"/>
                  <path d="M12 6v6l4.5 2.7.8-1.4-3.8-2.3V6z"/>
                </motion.svg>
              )}
              {voiceState === 'speaking' && (
                <svg className="w-full h-full text-[#0EA5E9]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              )}
            </motion.div>
          )}
        </div>
      </motion.button>

      {/* Voice Interface Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-28 right-6 z-40 w-80"
          >
            <div className="glass rounded-2xl p-6 shadow-2xl">
              {/* Status */}
              <div className="text-center mb-4">
                <h3 className="text-lg font-bold text-white mb-2">
                  {voiceState === 'idle' && t.voiceAgent.states.idle.title}
                  {voiceState === 'listening' && t.voiceAgent.states.listening.title}
                  {voiceState === 'processing' && t.voiceAgent.states.processing.title}
                  {voiceState === 'speaking' && t.voiceAgent.states.speaking.title}
                </h3>
                <p className="text-sm text-white/60">
                  {voiceState === 'idle' && t.voiceAgent.states.idle.description}
                  {voiceState === 'listening' && t.voiceAgent.states.listening.description}
                  {voiceState === 'processing' && t.voiceAgent.states.processing.description}
                  {voiceState === 'speaking' && t.voiceAgent.states.speaking.description}
                </p>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-white/50 mb-1">{t.voiceAgent.transcript}</p>
                  <p className="text-sm text-white">{transcript}</p>
                </div>
              )}

              {/* Error */}
              {displayError && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-400">{displayError}</p>
                </div>
              )}

              {/* Waveform Animation */}
              {voiceState === 'listening' && (
                <div className="flex items-center justify-center gap-1 h-16">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="w-2 bg-[#22C55E] rounded-full"
                      animate={{
                        height: [20, 40, 20],
                      }}
                      transition={{
                        duration: 0.8,
                        repeat: Infinity,
                        delay: i * 0.1,
                        ease: 'easeInOut',
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Auto-Close Countdown Prompt */}
              {showAutoClosePrompt && countdown !== null && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/30"
                >
                  <div className="text-center">
                    <p className="text-sm text-white/80 mb-3">
                      {t.voiceAgent.autoClose.prompt}
                    </p>
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <div className="text-2xl font-bold text-blue-400">
                        {countdown}
                      </div>
                      <p className="text-xs text-white/60">
                        {t.voiceAgent.autoClose.seconds}
                      </p>
                    </div>
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          clearAutoCloseCountdown();
                          startRecording();
                        }}
                        className="px-3 py-1.5 text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
                      >
                        {t.voiceAgent.autoClose.askAnother}
                      </button>
                      <button
                        onClick={clearAutoCloseCountdown}
                        className="px-3 py-1.5 text-xs bg-white/5 hover:bg-white/10 text-white/80 rounded-lg transition-colors"
                      >
                        {t.voiceAgent.autoClose.stayOpen}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                {voiceState === 'listening' && (
                  <button
                    onClick={() => {
                      // CRITICAL: Unlock iOS audio during user tap
                      iosAudioPlayerRef.current.unlock();
                      stopRecording();
                    }}
                    className="flex-1 btn-primary py-2 rounded-lg text-sm"
                  >
                    {t.voiceAgent.buttons.stop}
                  </button>
                )}
                <button
                  onClick={() => {
                    if (abortControllerRef.current) {
                      abortControllerRef.current.abort();
                    }
                    cancelRecording();
                    clearAutoCloseCountdown();
                    setIsOpen(false);
                    setVoiceState('idle');
                    setTranscript('');
                    setDisplayError(null);
                    clearSessionId(); // Clear session on close
                    setSessionId(null);
                  }}
                  className="flex-1 btn-glass py-2 rounded-lg text-sm"
                >
                  {t.voiceAgent.buttons.close}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
