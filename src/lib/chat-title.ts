const PREFIX_PATTERN =
  /^(hi|hello|hey|can you|could you|please|i need|i want|i would like|i'm looking for)\s+/i;

/**
 * Generate a human-readable chat title from the first user message.
 * Pure function with no external dependencies.
 */
export function generateFallbackTitle(message: string): string {
  let cleaned = message.trim();

  // Strip chained prefixes like "hello I need ..." or "can you please ..."
  let match: RegExpMatchArray | null;
  while ((match = cleaned.match(PREFIX_PATTERN))) {
    cleaned = cleaned.slice(match[0].length);
  }

  cleaned = cleaned.replace(/[!?.,;:]$/g, '').trim();

  const words = cleaned.split(/\s+/).filter((word) => word.length > 0);

  if (words.length === 0) {
    return 'New Chat';
  }

  const titleWords = words.slice(0, Math.min(4, words.length));
  let title = titleWords
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

  if (words.length > 4) {
    title += '...';
  }

  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }

  return title || 'New Chat';
}
