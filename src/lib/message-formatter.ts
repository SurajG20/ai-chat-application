/**
 * Message Formatting Utilities
 * Handles content formatting, code blocks, and text processing
 */

/**
 * Format message content with proper markdown rendering
 */
export function formatMessageContent(content: string): string {
  if (!content) return '';
  
  // Process code blocks first to avoid interference with other formatting
  let formattedContent = content;
  
  // Handle code blocks with syntax highlighting
  formattedContent = formattedContent.replace(
    /```(\w+)?\n([\s\S]*?)```/g,
    (match, language, code) => {
      const lang = language || 'text';
      return `<div class="code-block" data-language="${lang}">
        <div class="code-header">
          <span class="code-language">${lang}</span>
          <button class="copy-code-btn" onclick="copyCode(this)">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
            Copy
          </button>
        </div>
        <pre><code class="language-${lang}">${escapeHtml(code.trim())}</code></pre>
      </div>`;
    }
  );
  
  // Handle inline code
  formattedContent = formattedContent.replace(
    /`([^`]+)`/g,
    '<code class="inline-code">$1</code>'
  );
  
  // Handle headings
  formattedContent = formattedContent.replace(
    /^### (.*$)/gm,
    '<h3 class="text-lg font-semibold mt-4 mb-2 text-foreground">$1</h3>'
  );
  
  formattedContent = formattedContent.replace(
    /^## (.*$)/gm,
    '<h2 class="text-xl font-semibold mt-6 mb-3 text-foreground">$1</h2>'
  );
  
  formattedContent = formattedContent.replace(
    /^# (.*$)/gm,
    '<h1 class="text-2xl font-bold mt-8 mb-4 text-foreground">$1</h1>'
  );
  
  // Handle bold and italic
  formattedContent = formattedContent.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-semibold">$1</strong>'
  );
  
  formattedContent = formattedContent.replace(
    /\*(.*?)\*/g,
    '<em class="italic">$1</em>'
  );
  
  // Handle lists
  formattedContent = formattedContent.replace(
    /^- (.+)$/gm,
    '<li class="ml-4 mb-1">• $1</li>'
  );
  
  // Handle numbered lists
  formattedContent = formattedContent.replace(
    /^\d+\. (.+)$/gm,
    '<li class="ml-4 mb-1 list-decimal">$1</li>'
  );
  
  // Handle line breaks
  formattedContent = formattedContent.replace(/\n\n/g, '<br /><br />');
  formattedContent = formattedContent.replace(/\n/g, '<br />');
  
  return formattedContent;
}

/**
 * Escape HTML characters to prevent XSS
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

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
 * Extract plain text from formatted content for copying
 */
export function extractPlainText(content: string): string {
  return content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
    .replace(/&lt;/g, '<') // Replace HTML entities
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Smooth streaming text processor
 */
export class StreamingProcessor {
  private buffer: string = '';
  private lastUpdate: number = 0;
  private updateDelay: number = 50; // milliseconds between updates
  
  constructor(private onUpdate: (text: string) => void) {}
  
  addChunk(chunk: string): void {
    this.buffer += chunk;
    const now = Date.now();
    
    // Throttle updates for smoother streaming
    if (now - this.lastUpdate >= this.updateDelay) {
      this.flush();
      this.lastUpdate = now;
    }
  }
  
  flush(): void {
    if (this.buffer) {
      this.onUpdate(this.buffer);
      this.buffer = '';
    }
  }
  
  complete(): void {
    this.flush();
  }
}
