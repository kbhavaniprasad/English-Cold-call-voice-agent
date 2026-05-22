// ============================================================
// NEXUS AI — AIOrb Component
// Central animated orb that visualizes the call state
// ============================================================

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ConnectionState } from '../types';

interface AIOrBProps {
  connectionState: ConnectionState;
  isAgentSpeaking: boolean;
  isUserSpeaking: boolean;
}

const AIOrb: React.FC<AIOrBProps> = ({
  connectionState,
  isAgentSpeaking,
  isUserSpeaking,
}) => {
  const isConnected = connectionState === 'connected';
  const isConnecting = connectionState === 'connecting';
  const isEnded = connectionState === 'ended';

  // Determine orb color scheme
  const orbColors = useMemo(() => {
    if (isEnded) {
      return {
        primary: '#2a3a50',
        secondary: '#1a2534',
        glow: 'rgba(42, 58, 80, 0.4)',
        ring1: 'rgba(42, 58, 80, 0.15)',
        ring2: 'rgba(42, 58, 80, 0.08)',
      };
    }
    if (isConnecting) {
      return {
        primary: '#ffb400',
        secondary: '#ff8c00',
        glow: 'rgba(255, 180, 0, 0.5)',
        ring1: 'rgba(255, 180, 0, 0.2)',
        ring2: 'rgba(255, 180, 0, 0.1)',
      };
    }
    if (isUserSpeaking) {
      return {
        primary: '#7b2fff',
        secondary: '#5500cc',
        glow: 'rgba(123, 47, 255, 0.6)',
        ring1: 'rgba(123, 47, 255, 0.25)',
        ring2: 'rgba(123, 47, 255, 0.1)',
      };
    }
    if (isAgentSpeaking) {
      return {
        primary: '#00f5ff',
        secondary: '#0080ff',
        glow: 'rgba(0, 245, 255, 0.6)',
        ring1: 'rgba(0, 245, 255, 0.25)',
        ring2: 'rgba(0, 245, 255, 0.1)',
      };
    }
    // Idle / connected idle
    return {
      primary: '#00c4d4',
      secondary: '#4040aa',
      glow: 'rgba(0, 196, 212, 0.35)',
      ring1: 'rgba(0, 196, 212, 0.15)',
      ring2: 'rgba(0, 196, 212, 0.06)',
    };
  }, [isEnded, isConnecting, isAgentSpeaking, isUserSpeaking]);

  // Pulse rings for agent speaking
  const agentPulseRings = [0, 1, 2, 3];

  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      {/* Outer ambient glow */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${orbColors.ring2} 0%, transparent 70%)`,
          transform: 'scale(2)',
        }}
      />

      {/* Expanding pulse rings when agent is speaking */}
      <AnimatePresence>
        {isAgentSpeaking &&
          agentPulseRings.map((i) => (
            <motion.div
              key={`pulse-${i}`}
              className="absolute rounded-full pointer-events-none"
              style={{
                width: 160,
                height: 160,
                border: `1px solid ${orbColors.ring1}`,
              }}
              initial={{ scale: 0.6, opacity: 0.9 }}
              animate={{ scale: 2.8, opacity: 0 }}
              transition={{
                duration: 2.2,
                delay: i * 0.55,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          ))}
      </AnimatePresence>

      {/* User speaking aura */}
      <AnimatePresence>
        {isUserSpeaking && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 180,
              height: 180,
              background: `radial-gradient(circle, rgba(123, 47, 255, 0.2) 0%, transparent 65%)`,
            }}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{
              scale: [0.9, 1.15, 0.9],
              opacity: [0.3, 0.8, 0.3],
            }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>

      {/* Connecting spinner ring */}
      <AnimatePresence>
        {isConnecting && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 190,
              height: 190,
              border: '2px solid transparent',
              borderTopColor: 'var(--accent-amber)',
              borderRightColor: 'rgba(255, 180, 0, 0.4)',
            }}
            animate={{ rotate: 360 }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </AnimatePresence>

      {/* Second spinner ring (counter-rotating) */}
      <AnimatePresence>
        {isConnecting && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              width: 170,
              height: 170,
              border: '1px solid transparent',
              borderBottomColor: 'rgba(255, 180, 0, 0.5)',
              borderLeftColor: 'rgba(255, 180, 0, 0.2)',
            }}
            animate={{ rotate: -360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </AnimatePresence>

      {/* Main orb */}
      <motion.div
        className="relative rounded-full"
        style={{ width: 160, height: 160 }}
        animate={
          isConnecting
            ? { scale: [1, 1.04, 1], filter: ['brightness(1)', 'brightness(1.3)', 'brightness(1)'] }
            : isAgentSpeaking
            ? { scale: [1, 1.06, 1, 1.04, 1], filter: ['brightness(1.1)', 'brightness(1.4)', 'brightness(1.1)'] }
            : isUserSpeaking
            ? {}
            : isEnded
            ? { scale: 0.9, opacity: 0.5, filter: 'brightness(0.5) saturate(0.2)' }
            : { scale: [1, 1.04, 1] }
        }
        transition={
          isEnded
            ? { duration: 1.5, ease: 'easeOut' }
            : isConnecting
            ? { duration: 0.8, repeat: Infinity, ease: 'easeInOut' }
            : isAgentSpeaking
            ? { duration: 0.5, repeat: Infinity, ease: 'easeInOut' }
            : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        {/* Orb body */}
        <div
          className="w-full h-full rounded-full"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${orbColors.primary}, ${orbColors.secondary})`,
            boxShadow: `0 0 40px ${orbColors.glow}, 0 0 80px ${orbColors.ring1}, inset 0 0 30px rgba(255,255,255,0.06)`,
            transition: 'background 0.7s ease, box-shadow 0.7s ease',
          }}
        >
          {/* Inner highlight */}
          <div
            className="absolute rounded-full"
            style={{
              top: '12%',
              left: '15%',
              width: '40%',
              height: '35%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.18) 0%, transparent 70%)',
              transform: 'rotate(-30deg)',
            }}
          />

          {/* Grid lines overlay on orb */}
          <div
            className="absolute inset-0 rounded-full overflow-hidden"
            style={{ opacity: 0.12 }}
          >
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          </div>

          {/* Vibration overlay for user speaking */}
          <AnimatePresence>
            {isUserSpeaking && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  x: [0, -2, 2, -1, 1, 0],
                  y: [0, 1, -1, 2, -2, 0],
                }}
                transition={{
                  duration: 0.15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Inner concentric rings */}
        <div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            border: `1px solid rgba(255, 255, 255, 0.08)`,
            borderRadius: '50%',
          }}
        />
      </motion.div>

      {/* Ended state: gray decay overlay */}
      <AnimatePresence>
        {isEnded && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{ background: 'rgba(3, 4, 10, 0.5)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIOrb;
