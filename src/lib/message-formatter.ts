/**
 * Message text utilities: clipboard copy and markdown stripping.
 * Markdown rendering itself is handled by <MarkdownContent /> (react-markdown).
 */

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch {
      document.body.removeChild(textArea);
      return false;
    }
  }
}

/**
 * Extract plain text from formatted content for copying.
 * Strips markdown syntax (code fences, emphasis) and HTML markup,
 * keeping the human-readable text and code content.
 */
export function extractPlainText(content: string): string {
  return content
    .replace(/```+\w*\n?/g, '') // Remove code fences, keep code content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&lt;/g, '<') // Replace HTML entities
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/`([^`]+)`/g, '$1') // Inline code markers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1'); // Italic
}
