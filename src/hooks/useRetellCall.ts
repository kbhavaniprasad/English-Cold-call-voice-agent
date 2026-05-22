// ============================================================
// NEXUS AI — useRetellCall Hook
// Manages Retell AI WebSDK lifecycle + auto name detection
// ============================================================

import { useRef, useState, useCallback, useEffect } from 'react';
import { RetellWebClient } from 'retell-client-js-sdk';
import { ConnectionState, TranscriptEntry } from '../types';
import { getAccessToken } from '../api/retell';
import { extractNameFromTranscript } from '../utils/nameDetector';

const AGENT_ID = import.meta.env.VITE_RETELL_AGENT_ID ?? '';

interface UseRetellCallReturn {
  connectionState: ConnectionState;
  transcript: TranscriptEntry[];
  isAgentSpeaking: boolean;
  isUserSpeaking: boolean;
  callStartTime: Date | null;
  error: string | null;
  detectedUsername: string | null;
  startCall: () => Promise<void>;
  endCall: () => void;
}

export function useRetellCall(): UseRetellCallReturn {
  const clientRef = useRef<RetellWebClient | null>(null);

  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedUsername, setDetectedUsername] = useState<string | null>(null);

  const connectionStateRef = useRef<ConnectionState>('idle');
  const hasRetriedRef = useRef(false);

  const updateConnectionState = useCallback((state: ConnectionState) => {
    connectionStateRef.current = state;
    setConnectionState(state);
  }, []);

  const cleanupClient = useCallback(() => {
    if (clientRef.current) {
      try {
        clientRef.current.removeAllListeners?.();
      } catch {
        // ignore
      }
      clientRef.current = null;
    }
  }, []);

  const attachListeners = useCallback(
    (client: RetellWebClient) => {
      client.on('call_started', () => {
        const now = new Date();
        setCallStartTime(now);
        updateConnectionState('connected');
        setError(null);
        hasRetriedRef.current = false;
      });

      client.on('call_ended', () => {
        updateConnectionState('ended');
        setIsAgentSpeaking(false);
        setIsUserSpeaking(false);
      });

      client.on('agent_start_talking', () => {
        setIsAgentSpeaking(true);
        setIsUserSpeaking(false);
      });

      client.on('agent_stop_talking', () => {
        setIsAgentSpeaking(false);
      });

      client.on('update', (update: { transcript?: Array<{ role: string; content: string }> }) => {
        if (update?.transcript && Array.isArray(update.transcript)) {
          const entries: TranscriptEntry[] = update.transcript.map((t) => ({
            role: t.role === 'agent' ? 'agent' : 'user',
            content: t.content,
            timestamp: new Date(),
          }));
          setTranscript(entries);

          // Auto-detect name from updated transcript
          const detected = extractNameFromTranscript(entries);
          if (detected) {
            setDetectedUsername(detected);
          }

          const lastEntry = entries[entries.length - 1];
          if (lastEntry?.role === 'user') {
            setIsUserSpeaking(true);
            setIsAgentSpeaking(false);
          }
        }
      });

      client.on('error', async (err: Error | string) => {
        const msg = typeof err === 'string' ? err : err?.message ?? 'Unknown error';
        console.error('[Retell] Error:', msg);

        if (!hasRetriedRef.current && connectionStateRef.current === 'connecting') {
          hasRetriedRef.current = true;
          updateConnectionState('connecting');
          await new Promise((r) => setTimeout(r, 1500));
          try {
            const token = await getAccessToken(AGENT_ID);
            await client.startCall({
              accessToken: token,
              sampleRate: 24000,
              captureDeviceId: 'default',
              emitRawAudioSamples: false,
            });
          } catch (retryErr) {
            const retryMsg = retryErr instanceof Error ? retryErr.message : 'Retry failed';
            setError(retryMsg);
            updateConnectionState('error');
          }
        } else {
          setError(msg);
          updateConnectionState('error');
        }
      });
    },
    [updateConnectionState]
  );

  const startCall = useCallback(async () => {
    setTranscript([]);
    setError(null);
    setCallStartTime(null);
    setIsAgentSpeaking(false);
    setIsUserSpeaking(false);
    setDetectedUsername(null);
    hasRetriedRef.current = false;

    updateConnectionState('connecting');

    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Microphone access denied. Please allow microphone access and try again.');
      updateConnectionState('error');
      return;
    }

    try {
      cleanupClient();
      const token = await getAccessToken(AGENT_ID);
      const client = new RetellWebClient();
      clientRef.current = client;
      attachListeners(client);

      await client.startCall({
        accessToken: token,
        sampleRate: 24000,
        captureDeviceId: 'default',
        emitRawAudioSamples: false,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to start call';
      setError(msg);
      updateConnectionState('error');
      cleanupClient();
    }
  }, [attachListeners, cleanupClient, updateConnectionState]);

  const endCall = useCallback(() => {
    if (clientRef.current) {
      try {
        clientRef.current.stopCall();
      } catch (err) {
        console.error('[Retell] Error stopping call:', err);
      }
    }
    updateConnectionState('ended');
    setIsAgentSpeaking(false);
    setIsUserSpeaking(false);
    cleanupClient();
  }, [cleanupClient, updateConnectionState]);

  useEffect(() => {
    return () => {
      cleanupClient();
    };
  }, [cleanupClient]);

  return {
    connectionState,
    transcript,
    isAgentSpeaking,
    isUserSpeaking,
    callStartTime,
    error,
    detectedUsername,
    startCall,
    endCall,
  };
}
