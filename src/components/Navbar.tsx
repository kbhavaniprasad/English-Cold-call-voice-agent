// ============================================================
// NEXUS AI — Navbar — Premium Light Theme
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User } from 'lucide-react';
import { ConnectionState } from '../types';

interface NavbarProps {
  connectionState: ConnectionState;
  username: string | null;
}

function getStatusConfig(state: ConnectionState) {
  switch (state) {
    case 'idle':
      return { label: 'Ready', color: 'var(--text-dim)', bg: 'var(--bg-surface-2)', dot: null };
    case 'connecting':
      return { label: 'Connecting', color: 'var(--accent-amber)', bg: 'rgba(245,158,11,0.08)', dot: 'amber' };
    case 'connected':
      return { label: 'Live', color: 'var(--accent-green)', bg: 'rgba(16,185,129,0.08)', dot: 'green' };
    case 'ended':
      return { label: 'Ended', color: 'var(--text-muted)', bg: 'var(--bg-surface-2)', dot: null };
    case 'error':
      return { label: 'Error', color: 'var(--accent-red)', bg: 'rgba(239,68,68,0.07)', dot: null };
    default:
      return { label: 'Ready', color: 'var(--text-dim)', bg: 'var(--bg-surface-2)', dot: null };
  }
}

const Navbar: React.FC<NavbarProps> = ({ connectionState, username }) => {
  const [time, setTime] = useState('');
  const status = getStatusConfig(connectionState);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hh}:${mm}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav
      className="relative z-30 flex items-center justify-between px-6 h-[60px] flex-shrink-0"
      style={{
        background: 'rgba(255,255,255,0.92)',
        borderBottom: '1px solid var(--border-light)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 1px 0 rgba(148,163,184,0.08)',
      }}
    >
      {/* Left — Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 flex items-center justify-center rounded-xl"
          style={{ background: 'var(--grad-primary)', boxShadow: '0 2px 8px rgba(99,102,241,0.35)' }}
        >
          <Sparkles size={14} color="#fff" />
        </motion.div>

        <div className="flex items-baseline gap-1.5">
          <span
            className="font-jakarta font-800 text-base tracking-tight"
            style={{ color: 'var(--text-primary)', fontWeight: 800 }}
          >
            Nexus
          </span>
          <span
            className="text-gradient font-jakarta font-700 text-base tracking-tight"
            style={{ fontWeight: 700 }}
          >
            AI
          </span>
        </div>

        <div className="w-px h-5 mx-1" style={{ background: 'var(--border-light)' }} />

        <span
          className="text-xs hidden sm:block"
          style={{ color: 'var(--text-dim)', fontWeight: 500 }}
        >
          Voice Platform
        </span>
      </div>

      {/* Center — Status Pill */}
      <AnimatePresence mode="wait">
        <motion.div
          key={connectionState}
          initial={{ opacity: 0, scale: 0.9, y: -4 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 4 }}
          transition={{ duration: 0.2 }}
          className="flex items-center gap-2 px-4 py-1.5 rounded-full"
          style={{
            background: status.bg,
            border: `1.5px solid ${status.color}30`,
          }}
        >
          {status.dot === 'green' && <span className="pulse-dot-green" style={{ width: 6, height: 6 }} />}
          {status.dot === 'amber' && <span className="pulse-dot-amber" style={{ width: 6, height: 6 }} />}
          {!status.dot && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: status.color }}
            />
          )}
          <span
            className="text-xs font-semibold"
            style={{ color: status.color, fontFamily: 'Inter' }}
          >
            {status.label}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Right — Detected Name + Clock */}
      <div className="flex items-center gap-4">
        <AnimatePresence mode="wait">
          {username && (
            <motion.div
              key={username}
              initial={{ opacity: 0, x: 10, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -10, scale: 0.95 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="name-badge hidden sm:flex"
            >
              <User size={11} />
              {username}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="w-px h-5 hidden sm:block" style={{ background: 'var(--border-light)' }} />

        <div
          className="font-mono text-sm tabular-nums hidden sm:block"
          style={{ color: 'var(--text-muted)', minWidth: '48px', fontWeight: 500 }}
        >
          {time}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
