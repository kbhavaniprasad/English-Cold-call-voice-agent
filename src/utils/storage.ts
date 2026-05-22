// ============================================================
// NEXUS AI — localStorage Storage Utilities
// ============================================================

import { CallRecord } from '../types';

const STORAGE_KEY = 'nexus_call_history';
const USERNAME_KEY = 'nexus_last_username';

/** Retrieve all call records from localStorage */
export function getCallHistory(): CallRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed as CallRecord[];
  } catch {
    return [];
  }
}

/** Save a new call record to localStorage (prepend = most recent first) */
export function saveCallRecord(record: CallRecord): void {
  try {
    const history = getCallHistory();
    const updated = [record, ...history];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('[Storage] Failed to save call record:', err);
  }
}

/** Delete a call record by id */
export function deleteCallRecord(id: string): CallRecord[] {
  try {
    const history = getCallHistory();
    const updated = history.filter((r) => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error('[Storage] Failed to delete call record:', err);
    return getCallHistory();
  }
}

/** Get the last used username */
export function getLastUsername(): string {
  try {
    return localStorage.getItem(USERNAME_KEY) ?? '';
  } catch {
    return '';
  }
}

/** Save the last used username */
export function setLastUsername(username: string): void {
  try {
    localStorage.setItem(USERNAME_KEY, username.trim());
  } catch (err) {
    console.error('[Storage] Failed to save username:', err);
  }
}

/** Generate a unique ID for a call record */
export function generateId(): string {
  return `call_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
