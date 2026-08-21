import { describe, it, expect } from 'vitest';
import { extractPlainText } from './message-formatter';

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

  it('removes HTML tags and decodes entities', () => {
    const text = extractPlainText('<p>a &amp; b</p>');
    expect(text).toBe('a & b');
  });

  it('returns empty string for empty input', () => {
    expect(extractPlainText('')).toBe('');
  });
});
