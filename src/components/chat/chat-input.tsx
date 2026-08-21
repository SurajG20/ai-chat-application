'use client';

import { memo, useCallback, useRef, useEffect } from 'react';
import { Send, Square } from 'lucide-react';
import { Button } from '../ui/button';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [message]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
        <div className="flex gap-3 items-end">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={activePlaceholder}
            rows={1}
            maxLength={4000}
            className="flex-1 min-h-[44px] max-h-[200px] text-base bg-muted/50 border border-border text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary resize-none"
            disabled={isTyping}
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
