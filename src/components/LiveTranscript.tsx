// ============================================================
// NEXUS AI — LiveTranscript — Premium Light Theme
// Real-time conversation with elegant message bubbles
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
  detectedUsername?: string | null;
}

function TypingIndicator({ isAgent }: { isAgent: boolean }) {
  const color = isAgent ? 'var(--accent-indigo)' : 'var(--accent-violet)';
  return (
    <div className="flex items-center gap-1 px-1 py-0.5">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="typing-dot"
          style={{ background: color, animationDelay: `${i * 0.2}s` }}
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
  detectedUsername,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [transcript, isAgentSpeaking, isUserSpeaking]);

  const formatTime = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const handleCopy = useCallback(() => {
    if (!transcript.length) return;
    const text = transcript.map((t) => `[${t.role.toUpperCase()}]: ${t.content}`).join('\n\n');
    navigator.clipboard.writeText(text).catch(() => {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    });
  }, [transcript]);

  const handleDownload = useCallback(() => {
    if (!transcript.length) return;
    const lines = transcript.map((t) => `[${t.role.toUpperCase()}]: ${t.content}`).join('\n\n');
    const title  = callTitle || 'Nexus AI Call Transcript';
    const content = `Nexus AI — Call Transcript\nTitle: ${title}\n\n${'─'.repeat(60)}\n\n${lines}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [transcript, callTitle]);

  const hasContent = transcript.length > 0 || isAgentSpeaking || isUserSpeaking;
  const userName   = detectedUsername ?? 'You';

  return (
    <div
      className="w-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-light)',
        boxShadow: 'var(--shadow-card)',
        maxHeight: '42vh',
        minHeight: hasContent ? '180px' : '90px',
        transition: 'min-height 0.4s ease',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface-2)' }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--grad-soft)', border: '1px solid var(--border-accent)' }}
          >
            <MessageSquare size={13} style={{ color: 'var(--accent-indigo)' }} />
          </div>
          <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Live Transcript
          </span>
          <AnimatePresence>
            {(isAgentSpeaking || isUserSpeaking) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}
              >
                <span className="pulse-dot-green" style={{ width: 5, height: 5 }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--accent-green)' }}>Live</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {transcript.length > 0 && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              id="copy-transcript-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-accent)';
                e.currentTarget.style.color = 'var(--accent-indigo)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              title="Copy transcript"
            >
              <Copy size={11} />
              <span className="hidden sm:inline">Copy</span>
            </button>
            <button
              onClick={handleDownload}
              id="download-transcript-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-light)',
                color: 'var(--text-muted)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139,92,246,0.3)';
                e.currentTarget.style.color = 'var(--accent-violet)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-light)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
              title="Download transcript"
            >
              <Download size={11} />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 transcript-scroll">
        {!hasContent && (
          <div className="flex items-center justify-center h-full py-6">
            <div className="text-center">
              <MessageSquare size={24} className="mx-auto mb-2 opacity-20" style={{ color: 'var(--text-dim)' }} />
              <p className="text-sm" style={{ color: 'var(--text-dim)' }}>
                Conversation will appear here once the call begins…
              </p>
            </div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {transcript.map((entry, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex ${entry.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end gap-2.5 max-w-[82%]`}>

                {/* Avatar */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: entry.role === 'agent'
                      ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.10))'
                      : 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.10))',
                    border: `1.5px solid ${entry.role === 'agent' ? 'rgba(99,102,241,0.2)' : 'rgba(139,92,246,0.2)'}`,
                    boxShadow: '0 1px 4px rgba(15,23,42,0.06)',
                  }}
                >
                  {entry.role === 'agent'
                    ? <Bot size={13} style={{ color: 'var(--accent-indigo)' }} />
                    : <User size={13} style={{ color: 'var(--accent-violet)' }} />
                  }
                </div>

                {/* Bubble */}
                <div className={`rounded-2xl px-4 py-3 ${entry.role === 'agent' ? 'bubble-agent' : 'bubble-user'}`}
                  style={{ borderRadius: entry.role === 'agent' ? '4px 18px 18px 18px' : '18px 4px 18px 18px' }}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: entry.role === 'agent' ? 'var(--accent-indigo)' : 'var(--accent-violet)' }}
                    >
                      {entry.role === 'agent' ? 'Nexus AI' : userName}
                    </span>
                    {entry.timestamp && (
                      <span className="text-xs" style={{ color: 'var(--text-dim)', fontSize: '0.65rem' }}>
                        {formatTime(entry.timestamp)}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              className="flex justify-start"
            >
              <div className="flex items-end gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(59,130,246,0.10))', border: '1.5px solid rgba(99,102,241,0.2)' }}>
                  <Bot size={13} style={{ color: 'var(--accent-indigo)' }} />
                </div>
                <div className="bubble-agent rounded-2xl px-4 py-3" style={{ borderRadius: '4px 18px 18px 18px' }}>
                  <span className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--accent-indigo)' }}>Nexus AI</span>
                  <TypingIndicator isAgent={true} />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isUserSpeaking && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
              className="flex justify-end"
            >
              <div className="flex flex-row-reverse items-end gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.10))', border: '1.5px solid rgba(139,92,246,0.2)' }}>
                  <User size={13} style={{ color: 'var(--accent-violet)' }} />
                </div>
                <div className="bubble-user rounded-2xl px-4 py-3" style={{ borderRadius: '18px 4px 18px 18px' }}>
                  <span className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--accent-violet)' }}>{userName}</span>
                  <TypingIndicator isAgent={false} />
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
