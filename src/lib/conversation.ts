export type ChatRole = 'user' | 'assistant' | 'system';

export interface ConversationMessage {
  role: ChatRole;
  content: string;
}

export interface TruncateOptions {
  maxMessages?: number;
  maxChars?: number;
}

const DEFAULT_MAX_MESSAGES = 20;
const DEFAULT_MAX_CHARS = 12_000;

/**
 * Keep the most recent messages that fit within both the message-count
 * and character budgets. Oldest messages are dropped first. At least one
 * message is always kept so a request is never sent empty.
 */
export function truncateConversation(
  messages: ConversationMessage[],
  options: TruncateOptions = {}
): ConversationMessage[] {
  if (messages.length === 0) return [];

  const maxMessages = options.maxMessages ?? DEFAULT_MAX_MESSAGES;
  const maxChars = options.maxChars ?? DEFAULT_MAX_CHARS;

  const recent = messages.slice(-maxMessages);

  let totalChars = 0;
  let keepFrom = 0;

  for (let i = recent.length - 1; i >= 0; i--) {
    totalChars += recent[i].content.length;
    if (totalChars > maxChars && i > 0) {
      keepFrom = i + 1;
      break;
    }
  }

  return recent.slice(keepFrom);
}
