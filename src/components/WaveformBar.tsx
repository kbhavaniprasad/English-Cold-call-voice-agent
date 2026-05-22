// ============================================================
// NEXUS AI — WaveformBar — Premium Light Theme
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import { ConnectionState } from '../types';

interface WaveformBarProps {
  isAgentSpeaking: boolean;
  isUserSpeaking: boolean;
  connectionState: ConnectionState;
}

const BAR_COUNT = 9;
const BAR_HEIGHTS = [20, 32, 44, 52, 60, 52, 44, 32, 20];
const DELAYS     = [0, 0.08, 0.16, 0.04, 0.20, 0.12, 0.18, 0.06, 0.14];
const DURATIONS  = [0.55, 0.62, 0.50, 0.68, 0.58, 0.54, 0.60, 0.56, 0.52];

const WaveformBar: React.FC<WaveformBarProps> = ({
  isAgentSpeaking,
  isUserSpeaking,
  connectionState,
}) => {
  const isActive     = isAgentSpeaking || isUserSpeaking;
  const isConnecting = connectionState === 'connecting';

  const barClass = () => {
    if (isAgentSpeaking) return 'active-indigo';
    if (isUserSpeaking)  return 'active-violet';
    if (isConnecting)    return 'connecting';
    return 'idle';
  };

  return (
    <div className="flex items-end justify-center gap-1" style={{ height: 70 }}>
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const maxH    = BAR_HEIGHTS[i];
        const delay   = DELAYS[i];
        const dur     = DURATIONS[i];

        return (
          <motion.div
            key={i}
            className={`waveform-bar ${barClass()}`}
            style={{ width: 4 }}
            animate={
              isActive
                ? { height: [maxH * 0.2, maxH, maxH * 0.45, maxH * 0.85, maxH * 0.2], opacity: [0.6, 1, 0.8, 1, 0.6] }
                : isConnecting
                ? { height: [maxH * 0.15, maxH * 0.45, maxH * 0.15], opacity: [0.4, 0.75, 0.4] }
                : { height: maxH * 0.1, opacity: 0.2 }
            }
            transition={
              isActive || isConnecting
                ? { duration: dur, delay, repeat: Infinity, ease: 'easeInOut' }
                : { duration: 0.4, ease: 'easeOut' }
            }
          />
        );
      })}
    </div>
  );
};

export default WaveformBar;
