// ============================================================
// NEXUS AI — AIOrb Component — Premium Light Theme
// Central animated orb with soft pastel glow effects
// ============================================================

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectionState } from '../types';

interface AIOrBProps {
  connectionState: ConnectionState;
  isAgentSpeaking: boolean;
  isUserSpeaking: boolean;
}

const AIOrb: React.FC<AIOrBProps> = ({ connectionState, isAgentSpeaking, isUserSpeaking }) => {
  const isConnected  = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';
  const isEnded      = connectionState === 'ended';
  const isError      = connectionState === 'error';

  const orbColors = useMemo(() => {
    if (isError) return {
      primary:   '#EF4444',
      secondary: '#F87171',
      glow:      'rgba(239,68,68,0.25)',
      ring:      'rgba(239,68,68,0.12)',
      soft:      'rgba(239,68,68,0.06)',
    };
    if (isEnded) return {
      primary:   '#94A3B8',
      secondary: '#CBD5E1',
      glow:      'rgba(148,163,184,0.15)',
      ring:      'rgba(148,163,184,0.08)',
      soft:      'rgba(148,163,184,0.04)',
    };
    if (isConnecting) return {
      primary:   '#F59E0B',
      secondary: '#FCD34D',
      glow:      'rgba(245,158,11,0.35)',
      ring:      'rgba(245,158,11,0.15)',
      soft:      'rgba(245,158,11,0.07)',
    };
    if (isUserSpeaking) return {
      primary:   '#8B5CF6',
      secondary: '#A78BFA',
      glow:      'rgba(139,92,246,0.40)',
      ring:      'rgba(139,92,246,0.18)',
      soft:      'rgba(139,92,246,0.08)',
    };
    if (isAgentSpeaking) return {
      primary:   '#6366F1',
      secondary: '#818CF8',
      glow:      'rgba(99,102,241,0.45)',
      ring:      'rgba(99,102,241,0.20)',
      soft:      'rgba(99,102,241,0.08)',
    };
    // Connected idle
    if (isConnected) return {
      primary:   '#6366F1',
      secondary: '#818CF8',
      glow:      'rgba(99,102,241,0.20)',
      ring:      'rgba(99,102,241,0.10)',
      soft:      'rgba(99,102,241,0.04)',
    };
    // Idle default
    return {
      primary:   '#CBD5E1',
      secondary: '#E2E8F0',
      glow:      'rgba(148,163,184,0.12)',
      ring:      'rgba(148,163,184,0.06)',
      soft:      'rgba(148,163,184,0.03)',
    };
  }, [isConnected, isConnecting, isAgentSpeaking, isUserSpeaking, isEnded, isError]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>

      {/* Ambient background glow */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 320,
          height: 320,
          background: `radial-gradient(circle, ${orbColors.soft} 0%, transparent 70%)`,
          transition: 'background 0.8s ease',
        }}
      />

      {/* Pulse rings — agent speaking */}
      <AnimatePresence>
        {isAgentSpeaking && [0, 1, 2].map((i) => (
          <motion.div
            key={`pulse-${i}`}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 160,
              height: 160,
              border: `1.5px solid ${orbColors.ring}`,
            }}
            initial={{ scale: 0.7, opacity: 0.8 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{
              duration: 2.0,
              delay: i * 0.6,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </AnimatePresence>

      {/* Breathing ring — user speaking */}
      <AnimatePresence>
        {isUserSpeaking && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 190,
              height: 190,
              background: `radial-gradient(circle, ${orbColors.soft} 0%, transparent 65%)`,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: [0.9, 1.15, 0.9], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 1.0, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {/* Connecting spinner */}
      <AnimatePresence>
        {isConnecting && (
          <>
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 196,
                height: 196,
                border: '2px solid transparent',
                borderTopColor: orbColors.primary,
                borderRightColor: orbColors.ring,
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 174,
                height: 174,
                border: '1.5px solid transparent',
                borderBottomColor: orbColors.secondary,
                borderLeftColor: orbColors.ring,
              }}
              animate={{ rotate: -360 }}
              transition={{ duration: 1.7, repeat: Infinity, ease: 'linear' }}
            />
          </>
        )}
      </AnimatePresence>

      {/* Main orb body */}
      <motion.div
        className="relative rounded-full"
        style={{ width: 160, height: 160 }}
        animate={
          isConnecting
            ? { scale: [1, 1.04, 1], filter: ['brightness(1)', 'brightness(1.1)', 'brightness(1)'] }
            : isAgentSpeaking
            ? { scale: [1, 1.07, 1, 1.04, 1] }
            : isUserSpeaking
            ? {}
            : isEnded || isError
            ? { scale: 0.88, opacity: 0.55 }
            : isConnected
            ? { scale: [1, 1.03, 1] }
            : { scale: [1, 1.02, 1] }
        }
        transition={
          isEnded || isError
            ? { duration: 1.0, ease: 'easeOut' }
            : isConnecting
            ? { duration: 0.9, repeat: Infinity, ease: 'easeInOut' }
            : isAgentSpeaking
            ? { duration: 0.55, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {/* Orb surface */}
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${orbColors.secondary}, ${orbColors.primary} 60%, ${orbColors.primary}CC)`,
            boxShadow: `0 0 50px ${orbColors.glow}, 0 0 100px ${orbColors.ring}, 0 8px 32px rgba(15,23,42,0.12), inset 0 2px 0 rgba(255,255,255,0.3)`,
            transition: 'background 0.7s ease, box-shadow 0.7s ease',
          }}
        >
          {/* Glass highlight */}
          <div
            className="absolute rounded-full"
            style={{
              top: '10%',
              left: '14%',
              width: '42%',
              height: '36%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.45) 0%, transparent 70%)',
              transform: 'rotate(-20deg)',
            }}
          />
          {/* Secondary subtle highlight */}
          <div
            className="absolute rounded-full"
            style={{
              bottom: '18%',
              right: '18%',
              width: '20%',
              height: '16%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
            }}
          />

          {/* Vibration overlay — user speaking */}
          <AnimatePresence>
            {isUserSpeaking && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{ x: [0, -2, 2, -1, 1, 0], y: [0, 1, -1, 2, -2, 0] }}
                transition={{ duration: 0.12, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Subtle border ring */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ border: '1px solid rgba(255,255,255,0.25)', borderRadius: '50%' }}
        />
      </motion.div>

      {/* Ended overlay */}
      <AnimatePresence>
        {(isEnded || isError) && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(248,250,252,0.5)', borderRadius: '50%' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.0, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIOrb;
