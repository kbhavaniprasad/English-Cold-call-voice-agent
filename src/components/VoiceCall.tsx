// ============================================================
// NEXUS AI — VoiceCall Component — Premium Light Theme
// Main call area: no username modal, auto name detection
// ============================================================

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, PhoneOff, Loader2, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';
import { useRetellCall } from '../hooks/useRetellCall';
import { useCallHistory } from '../hooks/useCallHistory';
import AIOrb from './AIOrb';
import WaveformBar from './WaveformBar';
import CallTimer from './CallTimer';
import LiveTranscript from './LiveTranscript';
import { ConnectionState } from '../types';

type RetellHook = ReturnType<typeof useRetellCall>;

interface VoiceCallProps {
  retell: RetellHook;
}

function getStatusText(
  state: ConnectionState,
  isAgentSpeaking: boolean,
  isUserSpeaking: boolean
): string {
  switch (state) {
    case 'idle':       return 'Ready to connect';
    case 'connecting': return 'Connecting…';
    case 'connected':
      if (isAgentSpeaking) return 'AI is speaking…';
      if (isUserSpeaking)  return 'Listening to you…';
      return 'Connected · Awaiting input';
    case 'ended':  return 'Call ended';
    case 'error':  return 'Connection error';
    default:       return 'Ready to connect';
  }
}

function Toast({ type, message, onClose }: {
  type: 'error' | 'success' | 'info';
  message: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: 10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`toast toast-${type}`}
    >
      <div className="flex items-start gap-3">
        {type === 'error'   && <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />}
        {type === 'success' && <RefreshCw size={16} className="flex-shrink-0 mt-0.5" />}
        {type === 'info'    && <Mic size={16} className="flex-shrink-0 mt-0.5" />}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </motion.div>
  );
}

const VoiceCall: React.FC<VoiceCallProps> = ({ retell }) => {
  const {
    connectionState,
    transcript,
    isAgentSpeaking,
    isUserSpeaking,
    callStartTime,
    error,
    detectedUsername,
    startCall,
    endCall,
  } = retell;

  const { saveCall } = useCallHistory();

  const [callDuration, setCallDuration]   = useState('00:00');
  const [callTitle, setCallTitle]         = useState('');
  const [toastMessages, setToastMessages] = useState<
    Array<{ id: string; type: 'error' | 'success' | 'info'; message: string }>
  >([]);

  const hasSavedRef  = useRef(false);
  const prevStateRef = useRef<ConnectionState>('idle');

  // Toast for SDK errors
  useEffect(() => {
    if (error) addToast('error', error);
  }, [error]);

  // Auto-save when call ends
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = connectionState;

    if (
      connectionState === 'ended' &&
      prev === 'connected' &&
      !hasSavedRef.current &&
      callStartTime
    ) {
      hasSavedRef.current = true;
      const record = saveCall({
        username: detectedUsername ?? '',
        callStartTime,
        duration: callDuration,
        transcript,
        status: 'completed',
      });
      setCallTitle(record.title);
      addToast('success', `Session saved: "${record.title}"`);
    }

    if (connectionState === 'connecting') {
      hasSavedRef.current = false;
      setCallTitle('');
      setCallDuration('00:00');
    }
  }, [connectionState, detectedUsername, callStartTime, callDuration, transcript, saveCall]);

  const addToast = useCallback((type: 'error' | 'success' | 'info', message: string) => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    setToastMessages((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToastMessages((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleTimerTick = useCallback((formatted: string) => {
    setCallDuration(formatted);
  }, []);

  const isConnected  = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';
  const isActive     = isConnected || isConnecting;
  const statusText   = getStatusText(connectionState, isAgentSpeaking, isUserSpeaking);

  const statusColor = (() => {
    if (connectionState === 'error')  return 'var(--accent-red)';
    if (connectionState === 'ended')  return 'var(--text-dim)';
    if (isAgentSpeaking)              return 'var(--accent-indigo)';
    if (isUserSpeaking)               return 'var(--accent-violet)';
    if (isConnecting)                 return 'var(--accent-amber)';
    return 'var(--text-muted)';
  })();

  return (
    <>
      <motion.div
        className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* ── Hero Card ─── */}
        <motion.div
          className="w-full rounded-3xl p-8 flex flex-col items-center gap-6"
          style={{
            background: 'var(--grad-hero)',
            border: '1.5px solid var(--border-light)',
            boxShadow: '0 4px 30px rgba(99,102,241,0.06), 0 1px 0 rgba(255,255,255,0.8) inset',
          }}
        >
          {/* Detected name badge */}
          <AnimatePresence>
            {detectedUsername && (
              <motion.div
                key={detectedUsername}
                initial={{ opacity: 0, scale: 0.85, y: -8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: -8 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="name-badge"
              >
                <Sparkles size={11} />
                Detected: {detectedUsername}
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── AI Orb ── */}
          <motion.div
            animate={isConnecting ? { y: [0, -6, 0] } : {}}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <AIOrb
              connectionState={connectionState}
              isAgentSpeaking={isAgentSpeaking}
              isUserSpeaking={isUserSpeaking}
            />
          </motion.div>

          {/* ── Status Text ── */}
          <AnimatePresence mode="wait">
            <motion.p
              key={statusText}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-base font-semibold text-center"
              style={{ color: statusColor, transition: 'color 0.4s ease' }}
            >
              {statusText}
            </motion.p>
          </AnimatePresence>

          {/* ── Timer ── */}
          <CallTimer isRunning={isConnected} onTick={handleTimerTick} />

          {/* ── Waveform ── */}
          <WaveformBar
            isAgentSpeaking={isAgentSpeaking}
            isUserSpeaking={isUserSpeaking}
            connectionState={connectionState}
          />

          {/* ── Controls ── */}
          <div className="flex items-center gap-3 flex-wrap justify-center">

            {/* Start Call */}
            <AnimatePresence mode="wait">
              {!isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    id="start-call-btn"
                    className="btn-primary flex items-center gap-2.5 px-8 py-3.5"
                    onClick={startCall}
                    disabled={isConnecting}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    {isConnecting
                      ? <Loader2 size={18} className="animate-spin" />
                      : <Mic size={18} />
                    }
                    <span>{isConnecting ? 'Connecting…' : 'Start Voice Call'}</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* End Call */}
            <AnimatePresence>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 8 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                >
                  <motion.button
                    id="end-call-btn"
                    className="btn-danger flex items-center gap-2.5 px-8 py-3.5"
                    onClick={endCall}
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <PhoneOff size={18} />
                    <span>End Call</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* New Session */}
            <AnimatePresence>
              {(connectionState === 'ended' || connectionState === 'error') && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    id="new-session-btn"
                    className="flex items-center gap-2 px-6 py-3.5 rounded-full text-sm font-semibold transition-all duration-200"
                    style={{
                      background: 'var(--bg-surface)',
                      border: '1.5px solid var(--border-light)',
                      color: 'var(--text-muted)',
                      boxShadow: 'var(--shadow-sm)',
                    }}
                    onClick={startCall}
                    whileHover={{
                      scale: 1.04,
                      borderColor: 'var(--border-accent)',
                      color: 'var(--accent-indigo)',
                    }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <RefreshCw size={15} />
                    <span>New Session</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Live Transcript ── */}
        <div className="w-full">
          <LiveTranscript
            transcript={transcript}
            isAgentSpeaking={isAgentSpeaking}
            isUserSpeaking={isUserSpeaking}
            callTitle={callTitle}
            detectedUsername={detectedUsername}
          />
        </div>
      </motion.div>

      {/* ── Toast Stack ── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toastMessages.map((t) => (
            <Toast key={t.id} type={t.type} message={t.message} onClose={() => removeToast(t.id)} />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default VoiceCall;
