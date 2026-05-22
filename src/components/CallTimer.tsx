// ============================================================
// NEXUS AI — CallTimer Component
// Counts up from 00:00 while a call is active
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
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
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
          className="flex items-center gap-2"
        >
          <Timer
            size={14}
            style={{
              color: isRunning ? 'var(--accent-cyan)' : 'var(--text-muted)',
              animation: isRunning ? 'none' : undefined,
            }}
          />
          <span
            className="font-mono text-2xl font-semibold tabular-nums tracking-widest"
            style={{
              color: isRunning ? 'var(--accent-cyan)' : 'var(--text-muted)',
              textShadow: isRunning ? '0 0 12px rgba(0, 245, 255, 0.5)' : 'none',
              transition: 'color 0.5s ease, text-shadow 0.5s ease',
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
