// ============================================================
// NEXUS AI — Smart Name Detector
// Extracts user names from natural speech patterns in transcript
// ============================================================

import { TranscriptEntry } from '../types';
import { format } from 'date-fns';

/**
 * Patterns to detect user name introductions.
 * Handles: "I am Rahul", "This is Priya", "My name is Arjun",
 *          "Rahul speaking", "myself Kiran", "I'm Alex", etc.
 */
const NAME_PATTERNS: RegExp[] = [
  /\bmy name is ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/i,
  /\bi(?:'m| am) ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/i,
  /\bthis is ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/i,
  /\bmyself ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/i,
  /\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?) (?:speaking|here)\b/i,
  /\bhello[,\s]+(?:this is |i(?:'m| am) )?([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/i,
  /\bhi[,\s]+(?:this is |i(?:'m| am) )?([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/i,
  /\byeah[,\s]+(?:this is |i(?:'m| am) )?([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/i,
  /\byes[,\s]+(?:this is |i(?:'m| am) )?([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/i,
  /\bname'?s? ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/i,
  /\bcall me ([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/i,
];

// Words that are NOT names (common false positives)
const EXCLUDED_WORDS = new Set([
  'okay', 'sure', 'fine', 'good', 'great', 'right', 'well',
  'hello', 'calling', 'speaking', 'here', 'available', 'free',
  'interested', 'looking', 'doing', 'going', 'wondering', 'sorry',
  'afraid', 'busy', 'ready', 'happy', 'glad', 'the', 'this', 'that',
  'yeah', 'yes', 'no', 'not', 'just', 'also', 'still', 'already',
  'honestly', 'actually', 'basically', 'definitely', 'currently',
]);

/**
 * Extracts the first detected user name from transcript entries.
 * Only scans 'user' role entries.
 * Returns null if no name found.
 */
export function extractNameFromTranscript(transcript: TranscriptEntry[]): string | null {
  const userEntries = transcript.filter((e) => e.role === 'user');

  for (const entry of userEntries) {
    const text = entry.content.trim();

    for (const pattern of NAME_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        const candidate = match[1].trim();
        // Validate: not in excluded list, not too long, starts with uppercase
        if (
          candidate.length >= 2 &&
          candidate.length <= 30 &&
          !EXCLUDED_WORDS.has(candidate.toLowerCase()) &&
          /^[A-Z]/.test(candidate)
        ) {
          return capitalize(candidate);
        }
      }
    }
  }

  return null;
}

/**
 * Generate a smart fallback chat title when no name is detected.
 * Uses first meaningful user sentence + timestamp.
 */
export function generateFallbackTitle(
  transcript: TranscriptEntry[],
  callStartTime: Date
): string {
  const dateStr = format(callStartTime, 'MMM d, yyyy');
  const timeStr = format(callStartTime, 'h:mm a');

  // Try to extract topic from first non-trivial user message
  const userEntries = transcript.filter((e) => e.role === 'user');

  for (const entry of userEntries) {
    const topic = extractTopic(entry.content);
    if (topic) {
      return `${topic} — ${dateStr}, ${timeStr}`;
    }
  }

  // Generic fallback
  return `Cold Call Conversation — ${dateStr}, ${timeStr}`;
}

/**
 * Extract a short topic label from a sentence.
 */
function extractTopic(text: string): string | null {
  const cleaned = text.trim().replace(/[.!?,]+$/, '');
  if (cleaned.length < 5) return null;

  // Topic keywords to detect
  const topicMap: [RegExp, string][] = [
    [/insur/i, 'Insurance Inquiry'],
    [/job|work|employ|career|hiring/i, 'Job Discussion'],
    [/product|service|offer|deal|price|cost/i, 'Product Inquiry'],
    [/appointment|schedul|meeting|call back/i, 'Appointment Request'],
    [/loan|finance|credit|bank/i, 'Finance Inquiry'],
    [/health|medical|doctor|hospital/i, 'Healthcare Inquiry'],
    [/real estate|property|house|home|rent/i, 'Real Estate Inquiry'],
    [/invest|stock|market|fund/i, 'Investment Discussion'],
    [/support|help|issue|problem/i, 'Support Request'],
    [/sales|purchase|buy|order/i, 'Sales Inquiry'],
  ];

  for (const [regex, label] of topicMap) {
    if (regex.test(text)) return label;
  }

  // Use first 30 chars of first sentence as topic
  const firstSentence = cleaned.split(/[.!?]/)[0].trim();
  if (firstSentence.length >= 10) {
    return firstSentence.length > 35
      ? firstSentence.slice(0, 35) + '…'
      : firstSentence;
  }

  return null;
}

/**
 * Generate the final smart chat title.
 * Prefers: "Name — Date, Time"
 * Fallback: topic or generic title
 */
export function generateSmartTitle(
  transcript: TranscriptEntry[],
  callStartTime: Date,
  detectedName?: string | null
): string {
  const dateStr = format(callStartTime, 'MMM d, yyyy');
  const timeStr = format(callStartTime, 'h:mm a');

  const name = detectedName ?? extractNameFromTranscript(transcript);

  if (name) {
    return `${name} — ${dateStr}, ${timeStr}`;
  }

  return generateFallbackTitle(transcript, callStartTime);
}

function capitalize(str: string): string {
  return str
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}
