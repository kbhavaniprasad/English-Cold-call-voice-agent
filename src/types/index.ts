// ============================================================
// NEXUS AI — TypeScript Type Definitions
// ============================================================

export type ConnectionState = 'idle' | 'connecting' | 'connected' | 'ended' | 'error';

export type Speaker = 'agent' | 'user';

export type CallStatus = 'completed' | 'error' | 'interrupted';

export interface TranscriptEntry {
  role: Speaker;
  content: string;
  timestamp?: Date;
}

export interface CallRecord {
  id: string;
  title: string;
  username: string;
  date: string;           // Formatted: "DD-MM-YYYY"
  time: string;           // Formatted: "HH:MM AM/PM"
  duration: string;       // Formatted: "MM:SS"
  transcript: TranscriptEntry[];
  status: CallStatus;
  callStartTime: string;  // ISO string stored in localStorage
}

export interface SaveCallParams {
  username: string;
  callStartTime: Date;
  duration: string;
  transcript: TranscriptEntry[];
  status: CallStatus;
}

export interface RetellCallConfig {
  agentId: string;
  sampleRate?: number;
}

export interface ToastMessage {
  id: string;
  type: 'error' | 'success' | 'info';
  message: string;
}

export interface UsernameModalProps {
  isOpen: boolean;
  onConfirm: (username: string) => void;
  onClose: () => void;
}

export interface NavbarProps {
  connectionState: ConnectionState;
  username: string | null;
}

export interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  username: string | null;
}

export interface AIORbProps {
  connectionState: ConnectionState;
  isAgentSpeaking: boolean;
  isUserSpeaking: boolean;
}

export interface WaveformBarProps {
  isAgentSpeaking: boolean;
  isUserSpeaking: boolean;
  connectionState: ConnectionState;
}

export interface CallTimerProps {
  isRunning: boolean;
  onTick?: (formatted: string) => void;
}

export interface LiveTranscriptProps {
  transcript: TranscriptEntry[];
  isAgentSpeaking: boolean;
  isUserSpeaking: boolean;
  callTitle: string;
}

export interface VoiceCallProps {
  username: string | null;
  onUsernameRequest: () => void;
}
