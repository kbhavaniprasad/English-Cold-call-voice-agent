// ============================================================
// NEXUS AI — useCallHistory Hook
// Manages call history state with localStorage persistence
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { CallRecord, SaveCallParams } from '../types';
import {
  getCallHistory,
  saveCallRecord,
  deleteCallRecord,
  generateId,
} from '../utils/storage';

interface UseCallHistoryReturn {
  history: CallRecord[];
  isLoading: boolean;
  saveCall: (params: SaveCallParams) => CallRecord;
  deleteCall: (id: string) => void;
  searchHistory: (query: string) => CallRecord[];
}

/**
 * Generate the auto title for a call.
 * Format: "{username} call {DD-MM-YYYY} {HH:MM AM/PM}"
 * Date/time is derived from callStartTime.
 */
function generateCallTitle(username: string, callStartTime: Date): string {
  const dateStr = format(callStartTime, 'dd-MM-yyyy');
  const timeStr = format(callStartTime, 'hh:mm aa').toUpperCase(); // e.g. "09:30 PM"
  return `${username} call ${dateStr} ${timeStr}`;
}

export function useCallHistory(): UseCallHistoryReturn {
  const [history, setHistory] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    setIsLoading(true);
    try {
      const stored = getCallHistory();
      setHistory(stored);
    } catch {
      setHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveCall = useCallback((params: SaveCallParams): CallRecord => {
    const { username, callStartTime, duration, transcript, status } = params;

    const title = generateCallTitle(username, callStartTime);
    const dateStr = format(callStartTime, 'dd-MM-yyyy');
    const timeStr = format(callStartTime, 'hh:mm aa').toUpperCase();

    const record: CallRecord = {
      id: generateId(),
      title,
      username,
      date: dateStr,
      time: timeStr,
      duration,
      transcript,
      status,
      callStartTime: callStartTime.toISOString(),
    };

    saveCallRecord(record);
    setHistory((prev) => [record, ...prev]);
    return record;
  }, []);

  const deleteCall = useCallback((id: string) => {
    const updated = deleteCallRecord(id);
    setHistory(updated);
  }, []);

  const searchHistory = useCallback(
    (query: string): CallRecord[] => {
      if (!query.trim()) return history;
      const q = query.toLowerCase();
      return history.filter(
        (r) =>
          r.title.toLowerCase().includes(q) ||
          r.date.toLowerCase().includes(q) ||
          r.username.toLowerCase().includes(q)
      );
    },
    [history]
  );

  return { history, isLoading, saveCall, deleteCall, searchHistory };
}
