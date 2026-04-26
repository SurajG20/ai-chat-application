'use client';

import { memo, useCallback } from 'react';
import { Bot, User, Copy } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { formatMessageContent } from '../../lib/message-formatter';
import type { ChatMessage, MessageRole, AccentColor } from '../../types/chat';

interface MessageBubbleProps {
  message: ChatMessage;
  accentColor: AccentColor;
  onCopyMessage: (content: string) => void;
}

interface TypingIndicatorProps {
  accentColor: AccentColor;
}

// Memoized message content to prevent re-renders
const MessageContent = memo(function MessageContent({ 
  content, 
  role 
}: { 
  content: string; 
  role: MessageRole | string;
}) {
  if (role === 'assistant') {
    return (
      <div 
        className="text-sm whitespace-pre-wrap leading-relaxed message-content"
        dangerouslySetInnerHTML={{ __html: formatMessageContent(content) }}
      />
    );
  }
  return (
    <p className="text-sm whitespace-pre-wrap leading-relaxed">
      {content}
    </p>
  );
});

export const MessageBubble = memo(function MessageBubble({
  message,
  accentColor,
  onCopyMessage,
}: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const timestamp = new Date(message.createdAt).toLocaleTimeString();

  const handleCopy = useCallback(() => {
    onCopyMessage(message.content);
  }, [message.content, onCopyMessage]);

  return (
    <div className={`flex gap-2 lg:gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="text-black" style={{ backgroundColor: accentColor }}>
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <Card 
          className={`${isUser ? 'text-black' : 'bg-[#131313] border-white'} rounded-[20px]`}
          style={isUser ? { backgroundColor: accentColor } : undefined}
        >
          <CardContent className="px-3 py-2">
            <MessageContent content={message.content} role={message.role} />
          </CardContent>
        </Card>
        
        {!isUser ? (
          <div className="flex items-center justify-between w-full px-1">
            <p className="label-mono-sm text-[#949494] text-xs">{timestamp}</p>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-70 hover:opacity-100 transition-opacity p-1 h-auto text-[#949494] hover:text-white"
              onClick={handleCopy}
              title="Copy message"
            >
              <Copy className="w-3 h-3 mr-1" />
              <span className="text-xs label-mono-sm">COPY</span>
            </Button>
          </div>
        ) : (
          <p className="label-mono-sm text-[#949494] text-xs px-1">{timestamp}</p>
        )}
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarFallback className="bg-[#5200ff] text-white">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
});

export const TypingIndicator = memo(function TypingIndicator({
  accentColor,
}: TypingIndicatorProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <div 
          className="w-2 h-2 rounded-full animate-pulse" 
          style={{ backgroundColor: accentColor }}
        />
        <div 
          className="w-2 h-2 rounded-full animate-pulse" 
          style={{ animationDelay: '0.2s', backgroundColor: accentColor }}
        />
        <div 
          className="w-2 h-2 rounded-full animate-pulse" 
          style={{ animationDelay: '0.4s', backgroundColor: accentColor }}
        />
      </div>
      <p className="text-xs text-[#949494] label-mono-sm">AI is thinking...</p>
    </div>
  );
});
