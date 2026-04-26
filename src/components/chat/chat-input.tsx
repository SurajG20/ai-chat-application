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
    <div className="flex-shrink-0 border-t border-white p-4 lg:p-6 bg-[#131313]">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-2">
          <Input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={activePlaceholder}
            className="flex-1 text-sm lg:text-base bg-[#2d2d2d] border-white text-white placeholder:text-[#949494] rounded-[4px]"
          />
          <Button
            onClick={isTyping ? onStopResponse : onSendMessage}
            disabled={!message.trim() && !isTyping}
            size="icon"
            className="shrink-0 text-black rounded-full border-none"
            style={{ backgroundColor: accentColor }}
            title={isTyping ? "Stop response" : "Send message"}
          >
            {isTyping ? <Square className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
        <p className="label-mono-sm text-[#949494] text-xs mt-2 text-center hidden lg:block">
          PRESS ENTER TO SEND, SHIFT+ENTER FOR NEW LINE
        </p>
      </div>
    </div>
  );
});
