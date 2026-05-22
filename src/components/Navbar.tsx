// ============================================================
// NEXUS AI — Navbar Component
// Top bar with logo, live status badge, operator name, and clock
// ============================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio } from 'lucide-react';
import { ConnectionState } from '../types';

interface NavbarProps {
  connectionState: ConnectionState;
  username: string | null;
}

function getStatusConfig(state: ConnectionState) {
  switch (state) {
    case 'idle':
      return { label: 'IDLE', color: 'var(--text-muted)', dot: null };
    case 'connecting':
      return { label: 'CONNECTING', color: 'var(--accent-amber)', dot: 'amber' };
    case 'connected':
      return { label: 'LIVE', color: 'var(--accent-green)', dot: 'green' };
    case 'ended':
      return { label: 'ENDED', color: 'var(--accent-red)', dot: null };
    case 'error':
      return { label: 'ERROR', color: 'var(--accent-red)', dot: null };
    default:
      return { label: 'IDLE', color: 'var(--text-muted)', dot: null };
  }
}

const Navbar: React.FC<NavbarProps> = ({ connectionState, username }) => {
  const [time, setTime] = useState('');
  const status = getStatusConfig(connectionState);

  // Live clock — updates every second
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      const ss = String(now.getSeconds()).padStart(2, '0');
      setTime(`${hh}:${mm}:${ss}`);
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <nav
      className="relative z-30 flex items-center justify-between px-6 h-16 flex-shrink-0"
      style={{
        background: 'rgba(3, 4, 10, 0.9)',
        borderBottom: '1px solid rgba(0, 245, 255, 0.1)',
        backdropFilter: 'blur(20px)',
        boxShadow: '0 1px 0 rgba(0, 245, 255, 0.05)',
      }}
    >
      {/* Left — Logo */}
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="w-7 h-7 flex items-center justify-center"
        >
          <div
            className="w-6 h-6 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, var(--accent-cyan), var(--accent-violet), var(--accent-cyan))',
              boxShadow: '0 0 12px rgba(0, 245, 255, 0.5)',
            }}
          />
        </motion.div>

        <div className="flex items-center">
          <span
            className="font-orbitron font-bold text-lg tracking-widest"
            style={{
              color: 'var(--accent-cyan)',
              textShadow: '0 0 12px rgba(0, 245, 255, 0.7)',
            }}
          >
            NEXUS
          </span>
          <span
            className="font-orbitron font-light text-lg tracking-widest ml-2"
            style={{ color: 'var(--text-primary)' }}
          >
            AI
          </span>
        </div>

        {/* Divider */}
        <div
          className="w-px h-5 mx-2"
          style={{ background: 'rgba(0, 245, 255, 0.15)' }}
        />

        <span
          className="font-mono text-xs tracking-wider hidden sm:block"
          style={{ color: 'var(--text-muted)' }}
        >
          VOICE COMMAND CENTER
        </span>
      </div>

      {/* Center — Status Badge */}
      <div className="flex items-center gap-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={connectionState}
            initial={{ opacity: 0, scale: 0.9, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2 px-4 py-1.5 rounded-full"
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid ${status.color}33`,
            }}
          >
            {/* Status dot */}
            {status.dot === 'green' && (
              <span className="pulse-dot-green" />
            )}
            {status.dot === 'amber' && (
              <span className="pulse-dot-amber" />
            )}
            {!status.dot && (
              <span
                className="inline-block w-2 h-2 rounded-full"
                style={{ background: status.color, opacity: 0.7 }}
              />
            )}

            <Radio size={12} style={{ color: status.color }} />

            <span
              className="font-orbitron text-xs font-semibold tracking-widest"
              style={{ color: status.color }}
            >
              {status.label}
            </span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Right — Operator + Clock */}
      <div className="flex items-center gap-4">
        {/* Operator display */}
        <div className="hidden sm:flex items-center gap-2">
          <span
            className="font-orbitron text-xs tracking-wider"
            style={{ color: 'var(--text-muted)' }}
          >
            OPERATOR:
          </span>
          <AnimatePresence mode="wait">
            <motion.span
              key={username ?? 'none'}
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -6 }}
              transition={{ duration: 0.2 }}
              className="font-orbitron text-xs font-semibold tracking-wider"
              style={{
                color: username ? 'var(--accent-cyan)' : 'var(--text-muted)',
                textShadow: username ? '0 0 8px rgba(0,245,255,0.5)' : 'none',
              }}
            >
              {username ?? '—'}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* Vertical divider */}
        <div
          className="w-px h-5 hidden sm:block"
          style={{ background: 'rgba(0, 245, 255, 0.1)' }}
        />

        {/* Live clock */}
        <div
          className="font-mono text-sm tracking-widest tabular-nums"
          style={{ color: 'var(--text-muted)', minWidth: '80px' }}
        >
          {time}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
