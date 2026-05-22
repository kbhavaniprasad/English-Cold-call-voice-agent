// ============================================================
// NEXUS AI — useCallHistory Hook
// Manages call history with smart name detection & title generation
// ============================================================

import { useState, useCallback, useEffect } from 'react';
import { CallRecord, SaveCallParams } from '../types';
import { generateSmartTitle } from '../utils/nameDetector';
import {
  getCallHistory,
  saveCallRecord,
  deleteCallRecord,
  generateId,
} from '../utils/storage';
import { format } from 'date-fns';

interface UseCallHistoryReturn {
  history: CallRecord[];
  isLoading: boolean;
  saveCall: (params: SaveCallParams) => CallRecord;
  deleteCall: (id: string) => void;
  searchHistory: (query: string) => CallRecord[];
}

export function useCallHistory(): UseCallHistoryReturn {
  const [history, setHistory] = useState<CallRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

    // Generate smart title — uses detected name from transcript or fallback topic
    const title = generateSmartTitle(transcript, callStartTime, username || null);

    const dateStr = format(callStartTime, 'dd-MM-yyyy');
    const timeStr = format(callStartTime, 'hh:mm aa').toUpperCase();

    const record: CallRecord = {
      id: generateId(),
      title,
      username: username || 'Unknown',
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
