// ============================================================
// NEXUS AI — UsernameModal Component
// Animated modal to collect username before each call starts
// ============================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Zap, AlertCircle } from 'lucide-react';
import { UsernameModalProps } from '../types';
import { getLastUsername, setLastUsername } from '../utils/storage';

const UsernameModal: React.FC<UsernameModalProps> = ({ isOpen, onConfirm, onClose }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Pre-fill from localStorage on open
  useEffect(() => {
    if (isOpen) {
      const lastUsername = getLastUsername();
      setName(lastUsername);
      setError('');
      setShake(false);
      // Focus after animation completes
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  const triggerShake = useCallback(() => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }, []);

  const handleSubmit = useCallback(() => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Please enter your name to continue');
      triggerShake();
      return;
    }
    // Save to localStorage for next time
    setLastUsername(trimmed);
    onConfirm(trimmed);
  }, [name, onConfirm, triggerShake]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSubmit();
      if (e.key === 'Escape') onClose();
    },
    [handleSubmit, onClose]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (error) setError('');
  };

  const isValid = name.trim().length > 0;

  // Animation variants
  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: 'spring', damping: 22, stiffness: 300 },
    },
    exit: {
      opacity: 0,
      scale: 0.85,
      y: -15,
      transition: { duration: 0.25, ease: 'easeInOut' },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.04, duration: 0.3 },
    }),
  };

  const titleText = 'IDENTIFY YOURSELF';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0"
            style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(3, 4, 10, 0.75)' }}
            variants={backdropVariants}
            onClick={onClose}
          />

          {/* Card */}
          <motion.div
            className="relative z-10 w-full max-w-md"
            variants={cardVariants}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div
              className="relative overflow-hidden rounded-2xl p-8"
              style={{
                background: 'rgba(6, 9, 22, 0.97)',
                border: '1px solid rgba(0, 245, 255, 0.4)',
                boxShadow: '0 0 60px rgba(0, 245, 255, 0.12), 0 0 120px rgba(123, 47, 255, 0.08), 0 30px 80px rgba(0,0,0,0.7)',
              }}
            >
              {/* Corner decoration */}
              <div
                className="absolute top-0 left-0 w-8 h-8"
                style={{
                  borderTop: '2px solid var(--accent-cyan)',
                  borderLeft: '2px solid var(--accent-cyan)',
                  borderRadius: '8px 0 0 0',
                  opacity: 0.7,
                }}
              />
              <div
                className="absolute bottom-0 right-0 w-8 h-8"
                style={{
                  borderBottom: '2px solid var(--accent-violet)',
                  borderRight: '2px solid var(--accent-violet)',
                  borderRadius: '0 0 8px 0',
                  opacity: 0.7,
                }}
              />

              {/* Background glow blobs */}
              <div
                className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(0,245,255,0.06) 0%, transparent 70%)',
                }}
              />
              <div
                className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(123,47,255,0.06) 0%, transparent 70%)',
                }}
              />

              {/* Icon */}
              <div className="flex justify-center mb-6">
                <motion.div
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="relative"
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(123,47,255,0.15))',
                      border: '1px solid rgba(0,245,255,0.3)',
                      boxShadow: '0 0 20px rgba(0,245,255,0.2)',
                    }}
                  >
                    <UserCircle size={32} style={{ color: 'var(--accent-cyan)' }} />
                  </div>
                </motion.div>
              </div>

              {/* Title — staggered letter animation */}
              <div className="text-center mb-2">
                <h2
                  id="modal-title"
                  className="font-orbitron font-bold text-xl tracking-widest"
                  style={{ color: 'var(--accent-cyan)' }}
                >
                  {titleText.split('').map((char, i) => (
                    <motion.span
                      key={i}
                      custom={i}
                      variants={letterVariants}
                      initial="hidden"
                      animate="visible"
                      style={{
                        display: 'inline-block',
                        textShadow: '0 0 10px rgba(0,245,255,0.7)',
                      }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </motion.span>
                  ))}
                </h2>
              </div>

              {/* Subtitle */}
              <p
                className="font-rajdhani text-center text-sm mb-8 tracking-wide"
                style={{ color: 'var(--text-muted)' }}
              >
                Enter your name to begin the session
              </p>

              {/* Input field */}
              <div className="mb-3">
                <div className={shake ? 'shake' : ''}>
                  <input
                    ref={inputRef}
                    id="username-input"
                    type="text"
                    className={`nexus-input ${error ? 'error' : ''}`}
                    placeholder="Your name..."
                    value={name}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                    maxLength={50}
                    autoComplete="off"
                    spellCheck={false}
                    aria-invalid={!!error}
                    aria-describedby={error ? 'username-error' : undefined}
                  />
                </div>
              </div>

              {/* Error message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    id="username-error"
                    initial={{ opacity: 0, y: -6, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -6, height: 0 }}
                    className="flex items-center gap-2 mb-4"
                    style={{ color: 'var(--accent-red)' }}
                  >
                    <AlertCircle size={14} />
                    <span className="font-mono text-xs">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Divider */}
              <div
                className="my-6 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.2), transparent)',
                }}
              />

              {/* Submit button */}
              <motion.button
                id="begin-session-btn"
                className="btn-primary w-full flex items-center justify-center gap-3"
                onClick={handleSubmit}
                disabled={!isValid}
                whileHover={isValid ? { scale: 1.03 } : {}}
                whileTap={isValid ? { scale: 0.97 } : {}}
                style={
                  !isValid
                    ? {
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        color: 'var(--text-muted)',
                        boxShadow: 'none',
                        cursor: 'not-allowed',
                      }
                    : {}
                }
              >
                <Zap size={16} />
                <span>BEGIN SESSION</span>
              </motion.button>

              {/* Cancel */}
              <button
                onClick={onClose}
                className="w-full mt-3 font-rajdhani text-sm tracking-wider transition-colors duration-200 py-2"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = 'var(--text-primary)')
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = 'var(--text-muted)')
                }
              >
                CANCEL
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default UsernameModal;
