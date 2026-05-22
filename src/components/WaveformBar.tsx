// ============================================================
// NEXUS AI — WaveformBar Component
// Animated vertical waveform bars showing speaking state
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { ConnectionState } from '../types';

interface WaveformBarProps {
  isAgentSpeaking: boolean;
  isUserSpeaking: boolean;
  connectionState: ConnectionState;
}

const BAR_COUNT = 7;

// Different height profiles per bar to make it look natural
const BAR_HEIGHTS = [28, 44, 56, 64, 56, 44, 28];
const ANIMATION_DELAYS = [0, 0.1, 0.2, 0.0, 0.15, 0.05, 0.2];
const ANIMATION_DURATIONS = [0.55, 0.6, 0.5, 0.65, 0.58, 0.52, 0.6];

const WaveformBar: React.FC<WaveformBarProps> = ({
  isAgentSpeaking,
  isUserSpeaking,
  connectionState,
}) => {
  const isActive = isAgentSpeaking || isUserSpeaking;
  const isConnecting = connectionState === 'connecting';

  const getBarColor = () => {
    if (isAgentSpeaking) return 'var(--accent-cyan)';
    if (isUserSpeaking) return 'var(--accent-violet)';
    if (isConnecting) return 'var(--accent-amber)';
    return 'var(--text-dim)';
  };

  const getBarGlow = () => {
    if (isAgentSpeaking) return '0 0 8px rgba(0, 245, 255, 0.7)';
    if (isUserSpeaking) return '0 0 8px rgba(123, 47, 255, 0.7)';
    if (isConnecting) return '0 0 6px rgba(255, 180, 0, 0.5)';
    return 'none';
  };

  return (
    <div className="flex items-end justify-center gap-1.5" style={{ height: 70 }}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const maxHeight = BAR_HEIGHTS[i];
        const delay = ANIMATION_DELAYS[i];
        const duration = ANIMATION_DURATIONS[i];

        return (
          <motion.div
            key={i}
            style={{
              width: 4,
              borderRadius: 2,
              background: getBarColor(),
              boxShadow: getBarGlow(),
              transformOrigin: 'bottom center',
            }}
            animate={
              isActive
                ? {
                    height: [
                      maxHeight * 0.2,
                      maxHeight,
                      maxHeight * 0.4,
                      maxHeight * 0.85,
                      maxHeight * 0.2,
                    ],
                    opacity: [0.7, 1, 0.8, 1, 0.7],
                  }
                : isConnecting
                ? {
                    height: [maxHeight * 0.15, maxHeight * 0.4, maxHeight * 0.15],
                    opacity: [0.4, 0.7, 0.4],
                  }
                : {
                    height: maxHeight * 0.12,
                    opacity: 0.25,
                  }
            }
            transition={
              isActive || isConnecting
                ? {
                    duration,
                    delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }
                : { duration: 0.4, ease: 'easeOut' }
            }
          />
        );
      })}
    </div>
  );
};

export default WaveformBar;
