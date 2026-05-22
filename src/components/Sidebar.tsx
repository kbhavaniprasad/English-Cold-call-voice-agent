// ============================================================
// NEXUS AI — Sidebar Component
// Collapsible call history panel with search and transcript viewer
// ============================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, X, ChevronLeft, ChevronRight, Trash2, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { useCallHistory } from '../hooks/useCallHistory';
import { CallRecord, TranscriptEntry } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  username: string | null;
}

function StatusChip({ status }: { status: CallRecord['status'] }) {
  const config = {
    completed: {
      label: 'OK',
      color: 'var(--accent-green)',
      bg: 'rgba(0, 255, 136, 0.1)',
      icon: <CheckCircle size={10} />,
    },
    error: {
      label: 'ERR',
      color: 'var(--accent-red)',
      bg: 'rgba(255, 51, 88, 0.1)',
      icon: <XCircle size={10} />,
    },
    interrupted: {
      label: 'INT',
      color: 'var(--accent-amber)',
      bg: 'rgba(255, 180, 0, 0.1)',
      icon: <XCircle size={10} />,
    },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-xs font-semibold"
      style={{ color: config.color, background: config.bg, border: `1px solid ${config.color}33` }}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function TranscriptModal({
  record,
  onClose,
}: {
  record: CallRecord;
  onClose: () => void;
}) {
  const downloadTranscript = () => {
    const lines = record.transcript
      .map((t: TranscriptEntry) => `[${t.role.toUpperCase()}]: ${t.content}`)
      .join('\n\n');
    const content = `NEXUS AI — Call Transcript\n\nTitle: ${record.title}\nDate: ${record.date}\nTime: ${record.time}\nDuration: ${record.duration}\nStatus: ${record.status}\n\n${'─'.repeat(60)}\n\n${lines}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${record.title}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ backdropFilter: 'blur(8px)', background: 'rgba(3, 4, 10, 0.8)' }}
        onClick={onClose}
      />
      <motion.div
        className="relative z-10 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl overflow-hidden"
        initial={{ scale: 0.92, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 20 }}
        style={{
          background: 'rgba(6, 9, 22, 0.98)',
          border: '1px solid rgba(0, 245, 255, 0.25)',
          boxShadow: '0 0 60px rgba(0, 245, 255, 0.1), 0 30px 80px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid rgba(0, 245, 255, 0.1)' }}
        >
          <div>
            <h3
              className="font-orbitron font-bold text-sm tracking-wider"
              style={{ color: 'var(--accent-cyan)' }}
            >
              {record.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                {record.date} · {record.time}
              </span>
              <span className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                <Clock size={10} className="inline mr-1" />
                {record.duration}
              </span>
              <StatusChip status={record.status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadTranscript}
              className="px-3 py-1.5 rounded-lg font-mono text-xs font-semibold tracking-wider transition-all duration-200"
              style={{
                background: 'rgba(0, 245, 255, 0.08)',
                border: '1px solid rgba(0, 245, 255, 0.2)',
                color: 'var(--accent-cyan)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0, 245, 255, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(0, 245, 255, 0.08)';
              }}
            >
              DOWNLOAD
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'var(--text-primary)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'var(--text-muted)')
              }
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Transcript body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3 transcript-scroll">
          {record.transcript.length === 0 ? (
            <p
              className="font-mono text-sm text-center py-8"
              style={{ color: 'var(--text-muted)' }}
            >
              No transcript available for this session.
            </p>
          ) : (
            record.transcript.map((entry: TranscriptEntry, i: number) => (
              <div
                key={i}
                className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-4 py-3 ${entry.role === 'agent' ? 'bubble-agent' : 'bubble-user'}`}
                >
                  <span
                    className="block font-orbitron text-xs font-bold mb-1 uppercase tracking-wider"
                    style={{
                      color:
                        entry.role === 'agent'
                          ? 'var(--accent-cyan)'
                          : 'var(--accent-violet)',
                    }}
                  >
                    {entry.role === 'agent' ? 'NEXUS AI' : 'YOU'}
                  </span>
                  <p
                    className="font-mono text-xs leading-relaxed"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    {entry.content}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const { history, isLoading, deleteCall, searchHistory } = useCallHistory();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<CallRecord | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const filteredHistory = useMemo(
    () => searchHistory(searchQuery),
    [searchHistory, searchQuery]
  );

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDeleteId === id) {
      deleteCall(id);
      setConfirmDeleteId(null);
    } else {
      setConfirmDeleteId(id);
      setTimeout(() => setConfirmDeleteId(null), 2500);
    }
  };

  const sidebarWidth = 300;

  return (
    <>
      {/* Sidebar panel */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? sidebarWidth : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="flex-shrink-0 overflow-hidden relative z-20"
        style={{ borderRight: isOpen ? '1px solid rgba(0, 245, 255, 0.1)' : 'none' }}
      >
        <div
          className="h-full flex flex-col"
          style={{
            width: sidebarWidth,
            background: 'rgba(4, 6, 16, 0.95)',
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-4 flex-shrink-0"
            style={{ borderBottom: '1px solid rgba(0, 245, 255, 0.08)' }}
          >
            <div className="flex items-center gap-2">
              <History size={14} style={{ color: 'var(--accent-cyan)' }} />
              <span
                className="font-orbitron text-xs font-bold tracking-widest"
                style={{ color: 'var(--text-primary)' }}
              >
                CALL HISTORY
              </span>
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg transition-colors duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'var(--accent-cyan)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'var(--text-muted)')
              }
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-3 flex-shrink-0">
            <div className="relative">
              <Search
                size={13}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                placeholder="Search calls..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="sidebar-search"
                aria-label="Search call history"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 opacity-60 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* History list */}
          <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-2 transcript-scroll">
            {isLoading ? (
              /* Skeleton loading */
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shimmer h-16 rounded-lg" />
              ))
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <History
                  size={28}
                  className="mb-3 opacity-20"
                  style={{ color: 'var(--text-muted)' }}
                />
                <p
                  className="font-mono text-xs leading-relaxed"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {searchQuery
                    ? 'No calls match your search.'
                    : 'No calls yet.\nStart your first session.'}
                </p>
              </div>
            ) : (
              filteredHistory.map((record) => (
                <motion.div
                  key={record.id}
                  layout
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="history-item group relative"
                  onClick={() => setSelectedRecord(record)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedRecord(record)}
                  aria-label={`View transcript for ${record.title}`}
                >
                  {/* Title */}
                  <div className="pr-8 mb-1.5">
                    <p
                      className="font-mono text-xs font-semibold truncate leading-relaxed"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {record.title}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-mono text-xs flex items-center gap-1"
                      style={{ color: 'var(--text-muted)' }}
                    >
                      <Clock size={9} />
                      {record.duration}
                    </span>
                    <StatusChip status={record.status} />
                  </div>

                  {/* Action buttons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRecord(record);
                      }}
                      className="p-1 rounded transition-colors duration-150"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = 'var(--accent-cyan)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color = 'var(--text-muted)')
                      }
                      title="View transcript"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(record.id, e)}
                      className="p-1 rounded transition-colors duration-150"
                      style={{
                        color:
                          confirmDeleteId === record.id
                            ? 'var(--accent-red)'
                            : 'var(--text-muted)',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.color = 'var(--accent-red)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.color =
                          confirmDeleteId === record.id
                            ? 'var(--accent-red)'
                            : 'var(--text-muted)')
                      }
                      title={confirmDeleteId === record.id ? 'Click again to confirm' : 'Delete'}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Confirm delete tooltip */}
                  <AnimatePresence>
                    {confirmDeleteId === record.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 4 }}
                        className="mt-1.5 font-mono text-xs"
                        style={{ color: 'var(--accent-red)' }}
                      >
                        Click delete again to confirm
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          {!isLoading && history.length > 0 && (
            <div
              className="px-4 py-3 flex-shrink-0"
              style={{ borderTop: '1px solid rgba(0, 245, 255, 0.06)' }}
            >
              <p
                className="font-mono text-xs text-center"
                style={{ color: 'var(--text-muted)' }}
              >
                {history.length} session{history.length !== 1 ? 's' : ''} logged
              </p>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Toggle button (visible when sidebar is closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={onToggle}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-6 h-12 rounded-r-lg transition-all duration-200"
            style={{
              background: 'rgba(0, 245, 255, 0.08)',
              border: '1px solid rgba(0, 245, 255, 0.15)',
              borderLeft: 'none',
              color: 'var(--text-muted)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0, 245, 255, 0.15)';
              e.currentTarget.style.color = 'var(--accent-cyan)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0, 245, 255, 0.08)';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
            aria-label="Open sidebar"
          >
            <ChevronRight size={12} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Transcript Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <TranscriptModal
            record={selectedRecord}
            onClose={() => setSelectedRecord(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
