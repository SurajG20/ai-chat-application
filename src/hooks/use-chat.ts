'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import type { 
  ChatMessage, 
  ChatSession, 
  SendMessageInput, 
  TempUserMessage, 
  StreamData,
  AccentColor 
} from '../types/chat';

interface UseChatProps {
  userId?: number;
  accentColor: AccentColor;
}

interface UseChatReturn {
  // State
  currentSessionId: number | null;
  setCurrentSessionId: (id: number | null) => void;
  message: string;
  setMessage: (msg: string) => void;
  isTyping: boolean;
  streamingMessage: string;
  tempUserMessage: TempUserMessage | null;
  shouldStream: boolean;
  pendingMessage: SendMessageInput | null;
  
  // Data queries
  sessions: ChatSession[] | undefined;
  messages: ChatMessage[] | undefined;
  
  // Actions
  handleSendMessage: () => void;
  handleStopResponse: () => void;
  handleSelectQuickPrompt: (prompt: string, onStartNewChat?: () => void) => void;
  
  // Refs
  streamBufferRef: React.MutableRefObject<string[]>;
  streamingProcessorRef: React.MutableRefObject<StreamingProcessor | null>;
}

// Streaming processor for smooth text animation
export class StreamingProcessor {
  private buffer: string = '';
  private onUpdate: (text: string) => void;
  private animationFrame: number | null = null;
  private isComplete: boolean = false;

  constructor(onUpdate: (text: string) => void) {
    this.onUpdate = onUpdate;
  }

  addChunk(chunk: string): void {
    if (this.isComplete) return;
    this.buffer += chunk;
    
    if (this.animationFrame === null) {
      this.animationFrame = requestAnimationFrame(() => {
        this.onUpdate(this.buffer);
        this.animationFrame = null;
      });
    }
  }

  complete(): void {
    this.isComplete = true;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
    this.onUpdate(this.buffer);
  }

  reset(): void {
    this.buffer = '';
    this.isComplete = false;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}

export function useChat({ userId }: UseChatProps): UseChatReturn {
  // Core state
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [tempUserMessage, setTempUserMessage] = useState<TempUserMessage | null>(null);
  
  // Streaming state
  const [shouldStream, setShouldStream] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<SendMessageInput | null>(null);
  
  // Refs
  const streamBufferRef = useRef<string[]>([]);
  const streamingProcessorRef = useRef<StreamingProcessor | null>(null);

  // Data fetching
  const { data: sessions, refetch: refetchSessions } = trpc.chat.getSessions.useQuery(
    { userId },
    { enabled: !!userId }
  );

  const { data: messages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { sessionId: currentSessionId! },
    { enabled: !!currentSessionId }
  );

  // Mutations
  const createSessionWithMessageMutation = trpc.chat.createSessionWithMessage.useMutation({
    onSuccess: (session) => {
      setCurrentSessionId(session.id);
      refetchSessions();
    },
  });

  const updateSessionTitleMutation = trpc.chat.updateSessionTitle.useMutation({
    onSuccess: () => {
      refetchSessions();
    },
  });

  // Clear state when switching sessions
  useEffect(() => {
    setStreamingMessage('');
    setTempUserMessage(null);
    setIsTyping(false);
    setShouldStream(false);
    setPendingMessage(null);
    streamBufferRef.current = [];
    if (streamingProcessorRef.current) {
      streamingProcessorRef.current.reset();
      streamingProcessorRef.current = null;
    }
  }, [currentSessionId]);

  // Process stream buffer
  const processStreamBuffer = useCallback(() => {
    if (streamBufferRef.current.length > 0) {
      const charsToAdd = Math.min(3, streamBufferRef.current.length);
      const chars = streamBufferRef.current.splice(0, charsToAdd).join('');
      
      if (!streamingProcessorRef.current) {
        streamingProcessorRef.current = new StreamingProcessor((text) => {
          setStreamingMessage(text);
        });
      }
      
      streamingProcessorRef.current.addChunk(chars);
      
      if (streamBufferRef.current.length > 0) {
        requestAnimationFrame(processStreamBuffer);
      }
    }
  }, []);

  // Streaming subscription
  trpc.chat.sendMessageStream.useSubscription(
    pendingMessage!,
    {
      enabled: shouldStream && !!pendingMessage,
      onData: (data: StreamData) => {
        if (data.type === 'chunk' && data.content) {
          streamBufferRef.current.push(...data.content.split(''));
          processStreamBuffer();
        } else if (data.type === 'complete') {
          if (streamBufferRef.current.length > 0) {
            const remaining = streamBufferRef.current.join('');
            if (streamingProcessorRef.current) {
              streamingProcessorRef.current.addChunk(remaining);
            }
            streamBufferRef.current = [];
          }
          
          if (streamingProcessorRef.current) {
            streamingProcessorRef.current.complete();
            streamingProcessorRef.current = null;
          }
          
          setTimeout(() => {
            setStreamingMessage('');
            setTempUserMessage(null);
            setIsTyping(false);
            setShouldStream(false);
            setPendingMessage(null);
            refetchMessages();
          }, 100);
        } else if (data.type === 'error') {
          streamBufferRef.current = [];
          setStreamingMessage(data.content || 'An error occurred');
          setIsTyping(false);
          setTimeout(() => {
            setStreamingMessage('');
            setTempUserMessage(null);
            setShouldStream(false);
            setPendingMessage(null);
            refetchMessages();
          }, 2000);
        }
      },
      onError: () => {
        streamBufferRef.current = [];
        setIsTyping(false);
        setStreamingMessage('');
        setTempUserMessage(null);
        setShouldStream(false);
        setPendingMessage(null);
        if (streamingProcessorRef.current) {
          streamingProcessorRef.current.reset();
          streamingProcessorRef.current = null;
        }
      },
    }
  );

  const handleSendMessage = useCallback(() => {
    if (!message.trim() || isTyping) return;

    const userMessageContent = message;
    setMessage('');
    setIsTyping(true);
    setStreamingMessage('');
    
    setTempUserMessage({ 
      content: userMessageContent, 
      timestamp: new Date() 
    });

    if (!currentSessionId) {
      createSessionWithMessageMutation.mutate({
        userId,
        firstMessage: userMessageContent,
      }, {
        onSuccess: (session) => {
          setCurrentSessionId(session.id);
          setPendingMessage({
            sessionId: session.id,
            content: userMessageContent,
            userId,
          });
          setShouldStream(true);
          refetchSessions();
        },
        onError: () => {
          setIsTyping(false);
          setTempUserMessage(null);
          setMessage(userMessageContent);
        }
      });
    } else {
      const currentSession = sessions?.find((s: ChatSession) => s.id === currentSessionId);
      const isFirstMessage = currentSession && (
        currentSession.title === 'New Chat' || 
        currentSession.title.startsWith('New Chat')
      );
      
      setPendingMessage({
        sessionId: currentSessionId,
        content: userMessageContent,
        userId,
      });
      setShouldStream(true);
      
      if (isFirstMessage) {
        setTimeout(() => {
          updateSessionTitleMutation.mutate({
            sessionId: currentSessionId,
            title: userMessageContent
          });
        }, 1000);
      }
    }
  }, [message, isTyping, currentSessionId, userId, sessions, createSessionWithMessageMutation, updateSessionTitleMutation, refetchSessions]);

  const handleStopResponse = useCallback(() => {
    if (streamingProcessorRef.current) {
      streamingProcessorRef.current.reset();
      streamingProcessorRef.current = null;
    }
    
    setIsTyping(false);
    setStreamingMessage('');
    setTempUserMessage(null);
    setShouldStream(false);
    setPendingMessage(null);
    refetchMessages();
  }, [refetchMessages]);

  const handleSelectQuickPrompt = useCallback((prompt: string, onStartNewChat?: () => void) => {
    if (onStartNewChat) {
      onStartNewChat();
    }
    setMessage(prompt);
  }, []);

  return {
    currentSessionId,
    setCurrentSessionId,
    message,
    setMessage,
    isTyping,
    streamingMessage,
    tempUserMessage,
    shouldStream,
    pendingMessage,
    sessions,
    messages,
    handleSendMessage,
    handleStopResponse,
    handleSelectQuickPrompt,
    streamBufferRef,
    streamingProcessorRef,
  };
}

