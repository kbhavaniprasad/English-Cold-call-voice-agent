// ============================================================
// NEXUS AI — Sidebar — Premium Light Theme
// Collapsible call history panel with smart title display
// ============================================================

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  History, Search, X, ChevronLeft, ChevronRight,
  Trash2, Clock, CheckCircle, XCircle, Eye, Download,
  MessageSquare, User,
} from 'lucide-react';
import { useCallHistory } from '../hooks/useCallHistory';
import { CallRecord, TranscriptEntry } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  username: string | null;
}

function StatusChip({ status }: { status: CallRecord['status'] }) {
  const cfg = {
    completed:   { label: 'Done',  color: 'var(--accent-green)',  bg: 'rgba(16,185,129,0.08)',  icon: <CheckCircle size={10} /> },
    error:       { label: 'Error', color: 'var(--accent-red)',    bg: 'rgba(239,68,68,0.08)',   icon: <XCircle size={10} /> },
    interrupted: { label: 'Cut',   color: 'var(--accent-amber)',  bg: 'rgba(245,158,11,0.08)',  icon: <XCircle size={10} /> },
  }[status];

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.color}25` }}
    >
      {cfg.icon}
      {cfg.label}
    </span>
  );
}

function TranscriptModal({ record, onClose }: { record: CallRecord; onClose: () => void }) {
  const downloadTranscript = () => {
    const lines = record.transcript
      .map((t: TranscriptEntry) => `[${t.role.toUpperCase()}]: ${t.content}`)
      .join('\n\n');
    const content = `Nexus AI — Call Transcript\n\nTitle: ${record.title}\nDate: ${record.date}\nTime: ${record.time}\nDuration: ${record.duration}\nStatus: ${record.status}\n\n${'─'.repeat(60)}\n\n${lines}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 cursor-pointer"
        style={{ backdropFilter: 'blur(8px)', background: 'rgba(15,23,42,0.35)' }}
        onClick={onClose}
      />

      {/* Modal */}
      <motion.div
        className="relative z-10 w-full max-w-2xl max-h-[80vh] flex flex-col rounded-2xl overflow-hidden"
        initial={{ scale: 0.93, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.93, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        style={{
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-light)',
          boxShadow: 'var(--shadow-xl)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between p-5"
          style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface-2)' }}
        >
          <div>
            <h3 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
              {record.title}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>
                {record.date} · {record.time}
              </span>
              <span className="text-xs font-mono flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                <Clock size={10} />{record.duration}
              </span>
              <StatusChip status={record.status} />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadTranscript}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background: 'rgba(99,102,241,0.07)',
                border: '1px solid rgba(99,102,241,0.2)',
                color: 'var(--accent-indigo)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.12)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; }}
            >
              <Download size={12} /> Download
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg transition-colors duration-200"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Transcript body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 transcript-scroll">
          {record.transcript.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: 'var(--text-dim)' }}>
              No transcript available for this session.
            </p>
          ) : (
            record.transcript.map((entry: TranscriptEntry, i: number) => (
              <div key={i} className={`flex ${entry.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${entry.role === 'agent' ? 'bubble-agent' : 'bubble-user'}`}
                  style={{ borderRadius: entry.role === 'agent' ? '4px 18px 18px 18px' : '18px 4px 18px 18px' }}
                >
                  <span
                    className="block text-xs font-semibold mb-1.5"
                    style={{ color: entry.role === 'agent' ? 'var(--accent-indigo)' : 'var(--accent-violet)' }}
                  >
                    {entry.role === 'agent' ? 'Nexus AI' : (record.username || 'You')}
                  </span>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
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
  const [searchQuery, setSearchQuery]       = useState('');
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
      {/* Sidebar Panel */}
      <motion.aside
        initial={false}
        animate={{ width: isOpen ? sidebarWidth : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 280 }}
        className="flex-shrink-0 overflow-hidden relative z-20"
        style={{ borderRight: isOpen ? '1px solid var(--border-light)' : 'none' }}
      >
        <div
          className="h-full flex flex-col"
          style={{ width: sidebarWidth, background: 'var(--bg-surface)', backdropFilter: 'blur(20px)' }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
            style={{ borderBottom: '1px solid var(--border-light)', background: 'var(--bg-surface-2)' }}
          >
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'var(--grad-soft)', border: '1px solid var(--border-accent)' }}
              >
                <History size={13} style={{ color: 'var(--accent-indigo)' }} />
              </div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Call History
              </span>
              {!isLoading && history.length > 0 && (
                <span
                  className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                  style={{ background: 'rgba(99,102,241,0.1)', color: 'var(--accent-indigo)' }}
                >
                  {history.length}
                </span>
              )}
            </div>
            <button
              onClick={onToggle}
              className="p-1.5 rounded-lg transition-all duration-200"
              style={{ color: 'var(--text-dim)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-indigo)'; e.currentTarget.style.background = 'rgba(99,102,241,0.07)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
              aria-label="Collapse sidebar"
            >
              <ChevronLeft size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="px-3 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--border-light)' }}>
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--text-dim)' }} />
              <input
                type="text"
                placeholder="Search conversations…"
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                id="sidebar-search"
                aria-label="Search call history"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-dim)' }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 transcript-scroll">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="shimmer h-[68px] rounded-xl" />
              ))
            ) : filteredHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
                  style={{ background: 'var(--bg-surface-2)', border: '1px solid var(--border-light)' }}
                >
                  <MessageSquare size={20} style={{ color: 'var(--text-dim)', opacity: 0.5 }} />
                </div>
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-muted)' }}>
                  {searchQuery ? 'No results found' : 'No calls yet'}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                  {searchQuery ? 'Try a different search.' : 'Start your first voice session.'}
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
                  {/* User avatar + Title row */}
                  <div className="flex items-start gap-2.5 pr-8 mb-2">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{
                        background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))',
                        border: '1.5px solid rgba(99,102,241,0.15)',
                      }}
                    >
                      <User size={12} style={{ color: 'var(--accent-indigo)' }} />
                    </div>
                    <p
                      className="text-sm font-semibold truncate leading-tight"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      {record.title}
                    </p>
                  </div>

                  {/* Meta row */}
                  <div className="flex items-center gap-2 pl-9 flex-wrap">
                    <span
                      className="text-xs flex items-center gap-1 font-mono"
                      style={{ color: 'var(--text-dim)' }}
                    >
                      <Clock size={9} />{record.duration}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-dim)' }}>·</span>
                    <span className="text-xs" style={{ color: 'var(--text-dim)' }}>{record.time}</span>
                    <StatusChip status={record.status} />
                  </div>

                  {/* Hover action buttons */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelectedRecord(record); }}
                      className="p-1.5 rounded-lg transition-all duration-150"
                      style={{ color: 'var(--text-dim)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-indigo)'; e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
                      title="View transcript"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      onClick={(e) => handleDelete(record.id, e)}
                      className="p-1.5 rounded-lg transition-all duration-150"
                      style={{ color: confirmDeleteId === record.id ? 'var(--accent-red)' : 'var(--text-dim)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-red)'; e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = confirmDeleteId === record.id ? 'var(--accent-red)' : 'var(--text-dim)'; e.currentTarget.style.background = 'transparent'; }}
                      title={confirmDeleteId === record.id ? 'Click again to confirm' : 'Delete'}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* Confirm delete */}
                  <AnimatePresence>
                    {confirmDeleteId === record.id && (
                      <motion.p
                        initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
                        className="mt-1.5 text-xs pl-9"
                        style={{ color: 'var(--accent-red)' }}
                      >
                        Click delete again to confirm
                      </motion.p>
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
              style={{ borderTop: '1px solid var(--border-light)', background: 'var(--bg-surface-2)' }}
            >
              <p className="text-xs text-center" style={{ color: 'var(--text-dim)' }}>
                {history.length} session{history.length !== 1 ? 's' : ''} recorded
              </p>
            </div>
          )}
        </div>
      </motion.aside>

      {/* Toggle button (when closed) */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            onClick={onToggle}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-20 flex items-center justify-center w-6 h-12 rounded-r-xl transition-all duration-200"
            style={{
              background: 'var(--bg-surface)',
              border: '1.5px solid var(--border-light)',
              borderLeft: 'none',
              color: 'var(--text-dim)',
              boxShadow: 'var(--shadow-sm)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent-indigo)'; e.currentTarget.style.borderColor = 'var(--border-accent)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
            aria-label="Open sidebar"
          >
            <ChevronRight size={13} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Transcript Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <TranscriptModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
