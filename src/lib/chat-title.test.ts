import { describe, it, expect } from 'vitest';
import { generateFallbackTitle } from './chat-title';

describe('generateFallbackTitle', () => {
  it('returns "New Chat" for empty or whitespace-only messages', () => {
    expect(generateFallbackTitle('')).toBe('New Chat');
    expect(generateFallbackTitle('   ')).toBe('New Chat');
  });

  it('uses the greeting itself when the message is only a greeting', () => {
    expect(generateFallbackTitle('hi')).toBe('Hi');
    expect(generateFallbackTitle('hello!')).toBe('Hello');
  });

  it('strips common greeting prefixes', () => {
    expect(generateFallbackTitle('hello I need career advice')).toBe('Career Advice');
    expect(generateFallbackTitle('Can you help me find work?')).toBe('Help Me Find Work');
  });

  it('capitalizes words and limits to four', () => {
    expect(generateFallbackTitle('HOW TO BECOME A GREAT ENGINEER QUICKLY')).toBe(
      'How To Become A...'
    );
  });

  it('appends ellipsis when truncating long messages', () => {
    const title = generateFallbackTitle('one two three four five six');
    expect(title.endsWith('...')).toBe(true);
  });

  it('caps titles at 50 characters', () => {
    const title = generateFallbackTitle(
      'this is a very long message with many many words that goes on and on forever'
    );
    expect(title.length).toBeLessThanOrEqual(50);
    expect(title.endsWith('...')).toBe(true);
  });
});
