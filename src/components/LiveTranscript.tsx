// ============================================================
// NEXUS AI — LiveTranscript Component
// Real-time transcript rendering with glassmorphism bubbles
// ============================================================

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Download, MessageSquare, Bot, User } from 'lucide-react';
import { TranscriptEntry } from '../types';

interface LiveTranscriptProps {
  transcript: TranscriptEntry[];
  isAgentSpeaking: boolean;
  isUserSpeaking: boolean;
  callTitle: string;
}

function TypingIndicator({ color }: { color: string }) {
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot"
          style={{
            background: color,
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  transcript,
  isAgentSpeaking,
  isUserSpeaking,
  callTitle,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [transcript, isAgentSpeaking, isUserSpeaking]);

  const formatTime = (date?: Date) => {
    if (!date) return '';
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  };

  const handleCopyTranscript = useCallback(() => {
    if (transcript.length === 0) return;
    const text = transcript
      .map((t) => `[${t.role.toUpperCase()}]: ${t.content}`)
      .join('\n\n');
    navigator.clipboard.writeText(text).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  }, [transcript]);

  const handleDownloadTranscript = useCallback(() => {
    if (transcript.length === 0) return;
    const lines = transcript
      .map((t) => `[${t.role.toUpperCase()}]: ${t.content}`)
      .join('\n\n');
    const title = callTitle || 'NEXUS AI Call Transcript';
    const content = `NEXUS AI — Call Transcript\nTitle: ${title}\n\n${'─'.repeat(60)}\n\n${lines}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript, callTitle]);

  const hasContent = transcript.length > 0 || isAgentSpeaking || isUserSpeaking;

  return (
    <div
      className="w-full rounded-xl overflow-hidden flex flex-col"
      style={{
        background: 'rgba(4, 7, 18, 0.85)',
        border: '1px solid rgba(0, 245, 255, 0.1)',
        boxShadow: '0 0 30px rgba(0, 245, 255, 0.04), inset 0 1px 0 rgba(0, 245, 255, 0.06)',
        maxHeight: '40vh',
        minHeight: hasContent ? '160px' : '80px',
        backdropFilter: 'blur(20px)',
        transition: 'min-height 0.4s ease',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(0, 245, 255, 0.06)' }}
      >
        <div className="flex items-center gap-2">
          <MessageSquare size={12} style={{ color: 'var(--accent-cyan)' }} />
          <span
            className="font-orbitron text-xs font-bold tracking-widest"
            style={{ color: 'var(--text-primary)' }}
          >
            LIVE TRANSCRIPT
          </span>
          {(isAgentSpeaking || isUserSpeaking) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-1 ml-1"
            >
              <span className="pulse-dot-green" style={{ width: 6, height: 6 }} />
              <span className="font-mono text-xs" style={{ color: 'var(--accent-green)' }}>
                LIVE
              </span>
            </motion.div>
          )}
        </div>

        {transcript.length > 0 && (
          <div className="flex items-center gap-1">
            <button
              onClick={handleCopyTranscript}
              id="copy-transcript-btn"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs transition-all duration-200"
              style={{
                background: 'rgba(0, 245, 255, 0.05)',
                border: '1px solid rgba(0, 245, 255, 0.1)',
                color: 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 245, 255, 0.1)';
                e.currentTarget.style.color = 'var(--accent-cyan)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 245, 255, 0.05)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              title="Copy transcript"
            >
              <Copy size={11} />
              <span className="hidden sm:inline">COPY</span>
            </button>
            <button
              onClick={handleDownloadTranscript}
              id="download-transcript-btn"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-mono text-xs transition-all duration-200"
              style={{
                background: 'rgba(123, 47, 255, 0.05)',
                border: '1px solid rgba(123, 47, 255, 0.1)',
                color: 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(123, 47, 255, 0.12)';
                e.currentTarget.style.color = 'var(--accent-violet)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(123, 47, 255, 0.05)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              title="Download transcript"
            >
              <Download size={11} />
              <span className="hidden sm:inline">SAVE</span>
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 transcript-scroll">
        {!hasContent && (
          <div className="flex items-center justify-center h-full py-4">
            <p
              className="font-mono text-xs text-center"
              style={{ color: 'var(--text-dim)' }}
            >
              Transcript will appear here once the call begins...
            </p>
          </div>
        )}

        <AnimatePresence initial={false}>
          {transcript.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex ${entry.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-start gap-2 max-w-[85%]`}
              >
                {/* Avatar icon */}
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{
                    background:
                      entry.role === 'agent'
                        ? 'rgba(0, 245, 255, 0.12)'
                        : 'rgba(123, 47, 255, 0.12)',
                    border: `1px solid ${entry.role === 'agent' ? 'rgba(0, 245, 255, 0.25)' : 'rgba(123, 47, 255, 0.25)'}`,
                  }}
                >
                  {entry.role === 'agent' ? (
                    <Bot size={12} style={{ color: 'var(--accent-cyan)' }} />
                  ) : (
                    <User size={12} style={{ color: 'var(--accent-violet)' }} />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-xl px-4 py-2.5 ${
                    entry.role === 'agent' ? 'bubble-agent' : 'bubble-user'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="font-orbitron text-xs font-bold uppercase tracking-wider"
                      style={{
                        color:
                          entry.role === 'agent'
                            ? 'var(--accent-cyan)'
                            : 'var(--accent-violet)',
                      }}
                    >
                      {entry.role === 'agent' ? 'NEXUS AI' : 'YOU'}
                    </span>
                    {entry.timestamp && (
                      <span
                        className="font-mono text-xs opacity-50"
                        style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}
                      >
                        {formatTime(entry.timestamp)}
                      </span>
                    )}
                  </div>
                  <p
                    className="font-mono text-sm leading-relaxed"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {entry.content}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Speaking indicators */}
        <AnimatePresence>
          {isAgentSpeaking && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex justify-start"
            >
              <div className="flex items-start gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(0, 245, 255, 0.12)',
                    border: '1px solid rgba(0, 245, 255, 0.25)',
                  }}
                >
                  <Bot size={12} style={{ color: 'var(--accent-cyan)' }} />
                </div>
                <div className="rounded-xl px-4 py-2.5 bubble-agent">
                  <span
                    className="font-orbitron text-xs font-bold uppercase tracking-wider block mb-1"
                    style={{ color: 'var(--accent-cyan)' }}
                  >
                    NEXUS AI
                  </span>
                  <TypingIndicator color="var(--accent-cyan)" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isUserSpeaking && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="flex justify-end"
            >
              <div className="flex flex-row-reverse items-start gap-2">
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: 'rgba(123, 47, 255, 0.12)',
                    border: '1px solid rgba(123, 47, 255, 0.25)',
                  }}
                >
                  <User size={12} style={{ color: 'var(--accent-violet)' }} />
                </div>
                <div className="rounded-xl px-4 py-2.5 bubble-user">
                  <span
                    className="font-orbitron text-xs font-bold uppercase tracking-wider block mb-1"
                    style={{ color: 'var(--accent-violet)' }}
                  >
                    YOU
                  </span>
                  <TypingIndicator color="var(--accent-violet)" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LiveTranscript;
