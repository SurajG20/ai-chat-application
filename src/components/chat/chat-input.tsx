'use client';

import { memo, useCallback } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import type { AccentColor } from '../../types/chat';

interface ChatInputProps {
  message: string;
  setMessage: (msg: string) => void;
  isTyping: boolean;
  accentColor: AccentColor;
  onSendMessage: () => void;
  onStopResponse: () => void;
  placeholder?: string;
}

export const ChatInput = memo(function ChatInput({
  message,
  setMessage,
  isTyping,
  accentColor,
  onSendMessage,
  onStopResponse,
  placeholder = "Ask about your career goals, skills, or get advice...",
}: ChatInputProps) {
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
      e.preventDefault();
      onSendMessage();
    }
  }, [isTyping, onSendMessage]);

  const activePlaceholder = isTyping 
    ? "AI is responding... You can type your next message" 
    : placeholder;

  return (
    <div className="flex-shrink-0 border-t border-border p-4 lg:p-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="flex gap-3">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={activePlaceholder}
            className="flex-1 h-11 text-base bg-muted/50 border-border text-foreground placeholder:text-muted-foreground rounded-lg focus-visible:ring-primary"
          />
          <Button
            onClick={isTyping ? onStopResponse : onSendMessage}
            disabled={!message.trim() && !isTyping}
            size="icon"
            className="shrink-0 h-11 w-11 text-primary-foreground rounded-lg border-none hover:opacity-90 transition-opacity"
            style={{ backgroundColor: accentColor }}
            title={isTyping ? "Stop response" : "Send message"}
          >
            {isTyping ? <Square className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center hidden lg:block">
          Press <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Enter</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Shift</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-muted font-mono text-xs">Enter</kbd> for new line
        </p>
      </div>
    </div>
  );
});
