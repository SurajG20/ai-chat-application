import { describe, it, expect } from 'vitest';
import { truncateConversation } from './conversation';

describe('truncateConversation', () => {
  it('returns empty array for empty input', () => {
    expect(truncateConversation([])).toEqual([]);
  });

  it('keeps all messages when under both budgets', () => {
    const messages = [
      { role: 'user' as const, content: 'hello' },
      { role: 'assistant' as const, content: 'hi there' },
    ];
    expect(truncateConversation(messages)).toEqual(messages);
  });

  it('drops oldest messages first when over maxMessages', () => {
    const messages = Array.from({ length: 30 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `message ${i}`,
    }));

    const result = truncateConversation(messages, { maxMessages: 10 });
    expect(result).toHaveLength(10);
    expect(result[0].content).toBe('message 20');
    expect(result[9].content).toBe('message 29');
  });

  it('drops oldest messages first when over maxChars', () => {
    const messages = [
      { role: 'user' as const, content: 'a'.repeat(100) },
      { role: 'assistant' as const, content: 'b'.repeat(100) },
      { role: 'user' as const, content: 'c'.repeat(100) },
    ];

    // Only the last message fits within a 150-char cumulative budget
    const result = truncateConversation(messages, { maxChars: 150 });
    expect(result).toHaveLength(1);
    expect(result[0].content).toBe('c'.repeat(100));
  });

  it('always keeps at least one message even if it exceeds the char budget', () => {
    const messages = [{ role: 'user' as const, content: 'x'.repeat(500) }];
    const result = truncateConversation(messages, { maxChars: 10 });
    expect(result).toEqual(messages);
  });

  it('applies both budgets together', () => {
    const messages = Array.from({ length: 50 }, (_, i) => ({
      role: (i % 2 === 0 ? 'user' : 'assistant') as 'user' | 'assistant',
      content: `m${i}`.padEnd(50, 'z'),
    }));

    const result = truncateConversation(messages, { maxMessages: 5, maxChars: 120 });
    expect(result.length).toBeLessThanOrEqual(5);
    expect(result[result.length - 1].content.startsWith('m49')).toBe(true);
  });
});
