// ============================================================
// NEXUS AI — VoiceCall Component
// Main call control area: orb, status text, buttons, timer, transcript
// Receives the shared RetellWebClient hook from App.tsx
// ============================================================

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, PhoneOff, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';
import { useRetellCall } from '../hooks/useRetellCall';
import { useCallHistory } from '../hooks/useCallHistory';
import AIOrb from './AIOrb';
import WaveformBar from './WaveformBar';
import CallTimer from './CallTimer';
import LiveTranscript from './LiveTranscript';
import UsernameModal from './UsernameModal';
import { ConnectionState } from '../types';

type RetellHook = ReturnType<typeof useRetellCall>;

interface VoiceCallProps {
  retell: RetellHook;
  username: string | null;
  onUsernameUpdate: (name: string) => void;
}

function getStatusText(
  state: ConnectionState,
  isAgentSpeaking: boolean,
  isUserSpeaking: boolean
): string {
  switch (state) {
    case 'idle':      return 'Ready to connect';
    case 'connecting': return 'Connecting...';
    case 'connected':
      if (isAgentSpeaking) return 'AI Speaking...';
      if (isUserSpeaking)  return 'Listening...';
      return 'Connected · Awaiting input';
    case 'ended':  return 'Call Ended';
    case 'error':  return 'Connection Error';
    default:       return 'Ready to connect';
  }
}

// ── Inline Toast component ────────────────────────────────
function Toast({
  type,
  message,
  onClose,
}: {
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
        <span className="font-rajdhani text-sm">{message}</span>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────
const VoiceCall: React.FC<VoiceCallProps> = ({
  retell,
  username,
  onUsernameUpdate,
}) => {
  const {
    connectionState,
    transcript,
    isAgentSpeaking,
    isUserSpeaking,
    callStartTime,
    error,
    startCall,
    endCall,
  } = retell;

  const { saveCall } = useCallHistory();

  // Local state
  const [showModal, setShowModal]               = useState(false);
  const [currentUsername, setCurrentUsername]   = useState<string | null>(username);
  const [pendingCallStart, setPendingCallStart] = useState(false);
  const [callDuration, setCallDuration]         = useState('00:00');
  const [callTitle, setCallTitle]               = useState('');
  const [toastMessages, setToastMessages]       = useState<
    Array<{ id: string; type: 'error' | 'success' | 'info'; message: string }>
  >([]);

  // Refs
  const hasSavedRef     = useRef(false);
  const prevStateRef    = useRef<ConnectionState>('idle');

  // Keep currentUsername in sync with parent
  useEffect(() => {
    setCurrentUsername(username);
  }, [username]);

  // Show toast for SDK errors
  useEffect(() => {
    if (error) addToast('error', error);
  }, [error]);

  // Auto-save when call transitions connected → ended
  useEffect(() => {
    const prev = prevStateRef.current;
    prevStateRef.current = connectionState;

    if (
      connectionState === 'ended' &&
      prev === 'connected' &&
      !hasSavedRef.current &&
      currentUsername &&
      callStartTime
    ) {
      hasSavedRef.current = true;
      const record = saveCall({
        username: currentUsername,
        callStartTime,
        duration: callDuration,
        transcript,
        status: 'completed',
      });
      setCallTitle(record.title);
      addToast('success', `Session saved: "${record.title}"`);
    }

    // Reset for next call
    if (connectionState === 'connecting') {
      hasSavedRef.current = false;
      setCallTitle('');
      setCallDuration('00:00');
    }
  }, [connectionState, currentUsername, callStartTime, callDuration, transcript, saveCall]);

  // ── Toast helpers ──
  const addToast = useCallback(
    (type: 'error' | 'success' | 'info', message: string) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      setToastMessages((prev) => [...prev, { id, type, message }]);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToastMessages((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // ── Call flow ──
  const handleStartCallClick = useCallback(() => {
    setPendingCallStart(true);
    setShowModal(true);
  }, []);

  const handleUsernameConfirmed = useCallback(
    async (name: string) => {
      setCurrentUsername(name);
      onUsernameUpdate(name);
      setShowModal(false);
      if (pendingCallStart) {
        setPendingCallStart(false);
        await startCall();
      }
    },
    [pendingCallStart, startCall, onUsernameUpdate]
  );

  const handleModalClose = useCallback(() => {
    setShowModal(false);
    setPendingCallStart(false);
  }, []);

  const handleTimerTick = useCallback((formatted: string) => {
    setCallDuration(formatted);
  }, []);

  // ── Derived state ──
  const isConnected  = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';
  const isActive     = isConnected || isConnecting;
  const statusText   = getStatusText(connectionState, isAgentSpeaking, isUserSpeaking);

  const statusColor = (() => {
    if (connectionState === 'error')  return 'var(--accent-red)';
    if (connectionState === 'ended')  return 'var(--text-muted)';
    if (isAgentSpeaking)              return 'var(--accent-cyan)';
    if (isUserSpeaking)               return 'var(--accent-violet)';
    if (isConnecting)                 return 'var(--accent-amber)';
    return 'var(--text-primary)';
  })();

  const statusGlow =
    isAgentSpeaking ? '0 0 12px rgba(0,245,255,0.5)' :
    isUserSpeaking  ? '0 0 12px rgba(123,47,255,0.5)' :
    'none';

  // Stagger animation for status text
  const letterVariants = {
    hidden: { opacity: 0, y: 4 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.03, duration: 0.22 },
    }),
  };

  return (
    <>
      <div className="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto">

        {/* ── AI Orb ─────────────────────────────────── */}
        <motion.div
          animate={isConnecting ? { y: [0, -6, 0] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AIOrb
            connectionState={connectionState}
            isAgentSpeaking={isAgentSpeaking}
            isUserSpeaking={isUserSpeaking}
          />
        </motion.div>

        {/* ── Status Text ────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={statusText}
            initial="hidden"
            animate="visible"
            className="text-center"
          >
            <p
              className="font-orbitron font-semibold text-lg tracking-widest uppercase"
              style={{ color: statusColor, textShadow: statusGlow }}
            >
              {statusText.split('').map((char, i) => (
                <motion.span
                  key={`${statusText}-${i}`}
                  custom={i}
                  variants={letterVariants}
                  initial="hidden"
                  animate="visible"
                  style={{ display: 'inline-block' }}
                >
                  {char === ' ' ? '\u00A0' : char}
                </motion.span>
              ))}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* ── Call Timer ─────────────────────────────── */}
        <CallTimer isRunning={isConnected} onTick={handleTimerTick} />

        {/* ── Waveform Bars ──────────────────────────── */}
        <WaveformBar
          isAgentSpeaking={isAgentSpeaking}
          isUserSpeaking={isUserSpeaking}
          connectionState={connectionState}
        />

        {/* ── Call Control Buttons ───────────────────── */}
        <div className="flex items-center gap-4 flex-wrap justify-center">

          {/* START CALL button (only when idle / ended / error) */}
          <AnimatePresence mode="wait">
            {!isActive && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <motion.button
                  id="start-call-btn"
                  className="btn-primary flex items-center gap-3 px-8 py-4 text-base"
                  onClick={handleStartCallClick}
                  disabled={isConnecting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {isConnecting ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Mic size={18} />
                  )}
                  <span>
                    {isConnecting ? 'Connecting...' : 'Start Voice Call'}
                  </span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* END CALL button (only during active call) */}
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
                  className="btn-danger flex items-center gap-3 px-8 py-4 text-base"
                  onClick={endCall}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.96 }}
                >
                  <PhoneOff size={18} />
                  <span>End Call</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* NEW SESSION button (after ended/error) */}
          <AnimatePresence>
            {(connectionState === 'ended' || connectionState === 'error') && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.25 }}
              >
                <motion.button
                  id="new-session-btn"
                  className="flex items-center gap-2 px-6 py-4 rounded-full font-orbitron text-sm font-semibold tracking-wider transition-all duration-200"
                  style={{
                    background: 'rgba(0, 245, 255, 0.06)',
                    border: '1px solid rgba(0, 245, 255, 0.2)',
                    color: 'var(--text-muted)',
                  }}
                  onClick={handleStartCallClick}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: 'rgba(0, 245, 255, 0.12)',
                  }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Mic size={16} />
                  <span>New Session</span>
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Live Transcript ────────────────────────── */}
        <div className="w-full">
          <LiveTranscript
            transcript={transcript}
            isAgentSpeaking={isAgentSpeaking}
            isUserSpeaking={isUserSpeaking}
            callTitle={callTitle}
          />
        </div>
      </div>

      {/* ── Username Modal ─────────────────────────────── */}
      <UsernameModal
        isOpen={showModal}
        onConfirm={handleUsernameConfirmed}
        onClose={handleModalClose}
      />

      {/* ── Toast Notification Stack ───────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
        <AnimatePresence>
          {toastMessages.map((t) => (
            <Toast
              key={t.id}
              type={t.type}
              message={t.message}
              onClose={() => removeToast(t.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};

export default VoiceCall;
