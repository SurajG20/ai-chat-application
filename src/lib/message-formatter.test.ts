import { describe, it, expect } from 'vitest';
import { formatMessageContent, extractPlainText } from './message-formatter';

describe('formatMessageContent', () => {
  it('returns empty string for empty input', () => {
    expect(formatMessageContent('')).toBe('');
  });

  it('renders fenced code blocks with a copy button', () => {
    const result = formatMessageContent('```js\nconsole.log("hi");\n```');
    expect(result).toContain('code-block');
    expect(result).toContain('code-language');
    expect(result).toContain('copy-code-btn');
    expect(result).toContain('console.log');
  });

  it('escapes HTML inside code blocks', () => {
    const result = formatMessageContent('```\n<div>alert("xss")</div>\n```');
    expect(result).not.toContain('<div>alert');
    expect(result).toContain('&lt;div&gt;');
  });

  it('converts markdown headings', () => {
    expect(formatMessageContent('# Title')).toContain('<h1');
    expect(formatMessageContent('## Subtitle')).toContain('<h2');
    expect(formatMessageContent('### Section')).toContain('<h3');
  });

  it('converts bold and italic', () => {
    const result = formatMessageContent('**bold** and *italic*');
    expect(result).toContain('<strong class="font-semibold">bold</strong>');
    expect(result).toContain('<em class="italic">italic</em>');
  });
});

describe('extractPlainText', () => {
  it('strips code fences but keeps code content', () => {
    const text = extractPlainText('Here is code:\n```js\nlet x = 1;\n```');
    expect(text).toContain('Here is code:');
    expect(text).toContain('let x = 1;');
    expect(text).not.toContain('```');
  });

  it('removes markdown emphasis markers', () => {
    const text = extractPlainText('**bold** and *italic* and `code`');
    expect(text).toBe('bold and italic and code');
  });

  it('returns empty string for empty input', () => {
    expect(extractPlainText('')).toBe('');
  });
});
