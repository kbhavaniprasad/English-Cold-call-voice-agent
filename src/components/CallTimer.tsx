// ============================================================
// NEXUS AI — CallTimer — Premium Light Theme
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer } from 'lucide-react';

interface CallTimerProps {
  isRunning: boolean;
  onTick?: (formatted: string) => void;
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const CallTimer: React.FC<CallTimerProps> = ({ isRunning, onTick }) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      setSeconds(0);
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          const next = prev + 1;
          if (onTick) onTick(formatDuration(next));
          return next;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, onTick]);

  const formatted = formatDuration(seconds);

  return (
    <AnimatePresence>
      {(isRunning || seconds > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="flex items-center gap-2 px-4 py-2 rounded-full"
          style={{
            background: isRunning ? 'rgba(99,102,241,0.07)' : 'var(--bg-surface-2)',
            border: `1.5px solid ${isRunning ? 'rgba(99,102,241,0.2)' : 'var(--border-light)'}`,
          }}
        >
          <Timer
            size={14}
            style={{ color: isRunning ? 'var(--accent-indigo)' : 'var(--text-dim)' }}
          />
          <span
            className="font-mono text-xl font-semibold tabular-nums"
            style={{
              color: isRunning ? 'var(--accent-indigo)' : 'var(--text-muted)',
              transition: 'color 0.4s ease',
              letterSpacing: '0.05em',
            }}
          >
            {formatted}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CallTimer;
