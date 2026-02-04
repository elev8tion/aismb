'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LiquidMorphLogo from '../LiquidMorphLogo';

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export default function VoiceAgentFAB() {
  const [isOpen, setIsOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Check microphone permission
  useEffect(() => {
    if (isOpen && voiceState === 'idle') {
      checkMicrophonePermission();
    }
  }, [isOpen, voiceState]);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop immediately after checking
    } catch (err) {
      setError('Microphone access denied. Please allow microphone access to use voice assistant.');
      console.error('Microphone permission error:', err);
    }
  };

  const startListening = async () => {
    try {
      setError(null);
      setTranscript('');
      setVoiceState('listening');

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(track => track.stop());
        await processAudio(audioBlob);
      };

      mediaRecorder.start();

      // Auto-stop after 60 seconds (security limit)
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 60000);

    } catch (err) {
      setError('Failed to start recording. Please check microphone permissions.');
      setVoiceState('idle');
      console.error('Recording error:', err);
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    setVoiceState('processing');

    try {
      // Step 1: Transcribe audio with Whisper
      const transcribeResponse = await transcribeAudio(audioBlob);
      const userQuestion = transcribeResponse.text;
      setTranscript(userQuestion);

      // Step 2: Check voice cache or get response
      const response = await getResponse(userQuestion);

      // Step 3: Speak response
      await speakResponse(response);

    } catch (err) {
      setError('Failed to process your question. Please try again.');
      setVoiceState('idle');
      console.error('Processing error:', err);
    }
  };

  const transcribeAudio = async (audioBlob: Blob): Promise<{ text: string }> => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.webm');

    const response = await fetch('/api/voice-agent/transcribe', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Transcription failed');
    }

    return response.json();
  };

  const getResponse = async (question: string): Promise<string> => {
    console.log('Sending question to chat API:', question);

    const response = await fetch('/api/voice-agent/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Chat API error:', errorData);
      throw new Error(`Failed to get response: ${errorData.error || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.response;
  };

  const speakResponse = async (text: string) => {
    setVoiceState('speaking');

    const response = await fetch('/api/voice-agent/speak', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate speech');
    }

    const audioBlob = await response.blob();
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);

    audio.onended = () => {
      setVoiceState('idle');
      URL.revokeObjectURL(audioUrl);
    };

    audio.onerror = () => {
      setError('Failed to play audio response');
      setVoiceState('idle');
    };

    await audio.play();
  };

  const handleFABClick = () => {
    if (!isOpen) {
      setIsOpen(true);
      setTimeout(() => startListening(), 500); // Small delay for animation
    } else {
      if (voiceState === 'listening') {
        stopListening();
      } else {
        setIsOpen(false);
        setVoiceState('idle');
        setTranscript('');
        setError(null);
      }
    }
  };

  return (
    <>
      {/* FAB Button */}
      <motion.button
        onClick={handleFABClick}
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          width: isOpen ? 100 : 100,
          height: isOpen ? 100 : 100,
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
                  {voiceState === 'idle' && 'Ready to Help'}
                  {voiceState === 'listening' && 'Listening...'}
                  {voiceState === 'processing' && 'Processing...'}
                  {voiceState === 'speaking' && 'Speaking...'}
                </h3>
                <p className="text-sm text-white/60">
                  {voiceState === 'idle' && 'Click to ask a question'}
                  {voiceState === 'listening' && 'Speak your question'}
                  {voiceState === 'processing' && 'Thinking...'}
                  {voiceState === 'speaking' && 'Playing response'}
                </p>
              </div>

              {/* Transcript */}
              {transcript && (
                <div className="mb-4 p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-white/50 mb-1">You asked:</p>
                  <p className="text-sm text-white">{transcript}</p>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                  <p className="text-sm text-red-400">{error}</p>
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

              {/* Action Buttons */}
              <div className="flex gap-2 mt-4">
                {voiceState === 'listening' && (
                  <button
                    onClick={stopListening}
                    className="flex-1 btn-primary py-2 rounded-lg text-sm"
                  >
                    Stop
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setVoiceState('idle');
                    setTranscript('');
                    setError(null);
                  }}
                  className="flex-1 btn-glass py-2 rounded-lg text-sm"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
