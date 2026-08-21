'use client';

import { memo, useEffect, useRef } from 'react';
import { Bot } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { Card, CardContent } from '../ui/card';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Button } from '../ui/button';
import { MessageBubble, TypingIndicator } from './message-bubble';
import { MarkdownContent } from './markdown-content';
import type { ChatMessage, TempUserMessage, AccentColor } from '../../types/chat';

interface ChatMessageListProps {
  messages: ChatMessage[] | undefined;
  tempUserMessage: TempUserMessage | null;
  streamingMessage: string;
  isTyping: boolean;
  accentColor: AccentColor;
  isAtBottom: boolean;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  onCopyMessage: (content: string, isStreaming?: boolean) => void;
  onScrollToBottom: () => void;
  setIsAtBottom: (value: boolean) => void;
}

// Streaming message component
const StreamingMessage = memo(function StreamingMessage({
  content,
  accentColor,
  onCopy,
}: {
  content: string;
  accentColor: AccentColor;
  onCopy: () => void;
}) {
  return (
    <div className="flex gap-3 justify-start message-fade-in">
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarFallback className="text-primary-foreground" style={{ backgroundColor: accentColor }}>
          <Bot className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>
      <Card className="bg-muted/50 border-border rounded-xl max-w-[80%] gpu-accelerated">
        <CardContent className="px-4 py-3">
          <div className="text-sm streaming-text">
            <MarkdownContent content={content} />
          </div>
        </CardContent>
        <div className="flex items-center justify-between w-full px-4 pb-3 pt-1">
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span 
              className="w-1.5 h-1.5 rounded-full animate-pulse" 
              style={{ backgroundColor: accentColor }}
            />
            Streaming...
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-70 hover:opacity-100 transition-opacity p-1 h-auto text-xs text-muted-foreground hover:text-foreground"
            onClick={onCopy}
            title="Copy streaming message"
          >
            Copy
          </Button>
        </div>
      </Card>
    </div>
  );
});

export const ChatMessageList = memo(function ChatMessageList({
  messages,
  tempUserMessage,
  streamingMessage,
  isTyping,
  accentColor,
  isAtBottom,
  scrollAreaRef,
  messagesEndRef,
  onCopyMessage,
  onScrollToBottom,
  setIsAtBottom,
}: ChatMessageListProps) {
  const scrollContainerRef = useRef<HTMLElement | null>(null);

  // Setup scroll listener
  useEffect(() => {
    const container = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (container) {
      scrollContainerRef.current = container as HTMLElement;
      
      const handleScroll = () => {
        if (scrollContainerRef.current) {
          const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
          const threshold = 50;
          const isAtBottomNow = scrollHeight - scrollTop - clientHeight < threshold;
          setIsAtBottom(isAtBottomNow);
        }
      };
      
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [scrollAreaRef, setIsAtBottom]);

  // Check for duplicate temp message
  const shouldShowTempMessage = tempUserMessage && !messages?.some(
    (m: ChatMessage) => m.role === 'user' && m.content === tempUserMessage.content
  );

  return (
    <div className="flex-1 overflow-hidden relative">
      <ScrollArea ref={scrollAreaRef} className="h-full">
        <div className="px-4 py-3 lg:px-6 lg:py-4 space-y-3 lg:space-y-4">
          {messages?.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              accentColor={accentColor}
              onCopyMessage={onCopyMessage}
            />
          ))}
          
          {shouldShowTempMessage && (
            <div className="flex gap-2 lg:gap-3 justify-end message-fade-in">
              <div className="flex flex-col gap-1 max-w-[80%] items-end">
                <Card 
                  className="text-primary-foreground rounded-xl gpu-accelerated border-none" 
                  style={{ backgroundColor: accentColor }}
                >
                  <CardContent className="px-4 py-2">
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {tempUserMessage.content}
                    </p>
                  </CardContent>
                </Card>
                <p className="text-xs text-muted-foreground px-1">
                  {tempUserMessage.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          )}
          
          {streamingMessage && (
            <StreamingMessage
              content={streamingMessage}
              accentColor={accentColor}
              onCopy={() => onCopyMessage(streamingMessage, true)}
            />
          )}
          
          {isTyping && !streamingMessage && (
            <div className="flex gap-3 justify-start message-fade-in">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="text-primary-foreground" style={{ backgroundColor: accentColor }}>
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <Card className="bg-muted/50 border-border rounded-xl max-w-[80%] gpu-accelerated">
                <CardContent className="px-4 py-3">
                  <TypingIndicator accentColor={accentColor} />
                </CardContent>
              </Card>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      
      {/* Scroll to bottom button */}
      {!isAtBottom && (
        <Button
          onClick={onScrollToBottom}
          size="icon"
          className="absolute bottom-4 right-4 z-10 rounded-full text-primary-foreground shadow-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: accentColor }}
          aria-label="Scroll to bottom"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="16" 
            height="16" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12l7 7 7-7"/>
          </svg>
        </Button>
      )}
    </div>
  );
});
