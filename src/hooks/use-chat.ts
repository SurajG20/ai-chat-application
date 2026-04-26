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
  activeStreamingSessions: number[];
  
  // Data queries
  sessions: ChatSession[] | undefined;
  messages: ChatMessage[] | undefined;
  
  // Actions
  handleSendMessage: () => void;
  handleStopResponse: () => void;
  handleSelectQuickPrompt: (prompt: string, onStartNewChat?: () => void) => void;
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
  
  // Per-session streaming state using Maps
  const [isTypingPerSession, setIsTypingPerSession] = useState<Map<number, boolean>>(new Map());
  const [streamingMessages, setStreamingMessages] = useState<Map<number, string>>(new Map());
  const [tempUserMessages, setTempUserMessages] = useState<Map<number, TempUserMessage>>(new Map());
  const [pendingMessages, setPendingMessages] = useState<Map<number, SendMessageInput>>(new Map());
  const [shouldStreamPerSession, setShouldStreamPerSession] = useState<Map<number, boolean>>(new Map());
  
  // Per-session refs using Maps
  const streamBuffers = useRef<Map<number, string[]>>(new Map());
  const streamingProcessors = useRef<Map<number, StreamingProcessor>>(new Map());

  // Derived state for current session
  const isTyping = currentSessionId ? (isTypingPerSession.get(currentSessionId) ?? false) : false;
  const streamingMessage = currentSessionId ? (streamingMessages.get(currentSessionId) ?? '') : '';
  const tempUserMessage = currentSessionId ? (tempUserMessages.get(currentSessionId) ?? null) : null;
  const activeStreamingSessions = Array.from(pendingMessages.keys());

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

  // Clear temp message when switching sessions (but keep streaming state)
  useEffect(() => {
    if (currentSessionId) {
      // Only clear temp message for current session, keep streaming state
      setTempUserMessages(prev => {
        const next = new Map(prev);
        // Don't clear here - the temp message should persist until stream completes
        return next;
      });
    }
  }, [currentSessionId]);

  // Process stream buffer for a specific session
  const processStreamBuffer = useCallback((sessionId: number) => {
    const buffer = streamBuffers.current.get(sessionId);
    if (buffer && buffer.length > 0) {
      const charsToAdd = Math.min(3, buffer.length);
      const chars = buffer.splice(0, charsToAdd).join('');
      
      let processor = streamingProcessors.current.get(sessionId);
      if (!processor) {
        processor = new StreamingProcessor((text) => {
          setStreamingMessages(prev => {
            const next = new Map(prev);
            next.set(sessionId, text);
            return next;
          });
        });
        streamingProcessors.current.set(sessionId, processor);
      }
      
      processor.addChunk(chars);
      
      if (buffer.length > 0) {
        requestAnimationFrame(() => processStreamBuffer(sessionId));
      }
    }
  }, []);

  // Handle stream data for a specific session
  const handleStreamData = useCallback((data: StreamData) => {
    const sessionId = data.sessionId;
    if (!sessionId) return;

    if (data.type === 'chunk' && data.content) {
      const buffer = streamBuffers.current.get(sessionId) || [];
      buffer.push(...data.content.split(''));
      streamBuffers.current.set(sessionId, buffer);
      processStreamBuffer(sessionId);
    } else if (data.type === 'complete') {
      const buffer = streamBuffers.current.get(sessionId);
      if (buffer && buffer.length > 0) {
        const remaining = buffer.join('');
        const processor = streamingProcessors.current.get(sessionId);
        if (processor) {
          processor.addChunk(remaining);
        }
        buffer.length = 0;
      }
      
      const processor = streamingProcessors.current.get(sessionId);
      if (processor) {
        processor.complete();
        streamingProcessors.current.delete(sessionId);
      }
      
      // Clear stream state for this session after a delay
      setTimeout(() => {
        setStreamingMessages(prev => {
          const next = new Map(prev);
          next.delete(sessionId);
          return next;
        });
        setTempUserMessages(prev => {
          const next = new Map(prev);
          next.delete(sessionId);
          return next;
        });
        setIsTypingPerSession(prev => {
          const next = new Map(prev);
          next.set(sessionId, false);
          return next;
        });
        setShouldStreamPerSession(prev => {
          const next = new Map(prev);
          next.delete(sessionId);
          return next;
        });
        setPendingMessages(prev => {
          const next = new Map(prev);
          next.delete(sessionId);
          return next;
        });
        streamBuffers.current.delete(sessionId);
        
        // Refetch messages for the completed session
        if (sessionId === currentSessionId) {
          refetchMessages();
        }
      }, 100);
    } else if (data.type === 'error') {
      streamBuffers.current.delete(sessionId);
      
      setStreamingMessages(prev => {
        const next = new Map(prev);
        next.set(sessionId, data.content || 'An error occurred');
        return next;
      });
      
      setIsTypingPerSession(prev => {
        const next = new Map(prev);
        next.set(sessionId, false);
        return next;
      });
      
      setTimeout(() => {
        setStreamingMessages(prev => {
          const next = new Map(prev);
          next.delete(sessionId);
          return next;
        });
        setTempUserMessages(prev => {
          const next = new Map(prev);
          next.delete(sessionId);
          return next;
        });
        setShouldStreamPerSession(prev => {
          const next = new Map(prev);
          next.delete(sessionId);
          return next;
        });
        setPendingMessages(prev => {
          const next = new Map(prev);
          next.delete(sessionId);
          return next;
        });
        
        if (sessionId === currentSessionId) {
          refetchMessages();
        }
      }, 2000);
    }
  }, [currentSessionId, refetchMessages, processStreamBuffer]);

  // Handle stream error for a specific session
  const handleStreamError = useCallback((sessionId: number) => {
    streamBuffers.current.delete(sessionId);
    
    setIsTypingPerSession(prev => {
      const next = new Map(prev);
      next.set(sessionId, false);
      return next;
    });
    
    setStreamingMessages(prev => {
      const next = new Map(prev);
      next.delete(sessionId);
      return next;
    });
    
    setTempUserMessages(prev => {
      const next = new Map(prev);
      next.delete(sessionId);
      return next;
    });
    
    setShouldStreamPerSession(prev => {
      const next = new Map(prev);
      next.delete(sessionId);
      return next;
    });
    
    setPendingMessages(prev => {
      const next = new Map(prev);
      next.delete(sessionId);
      return next;
    });
    
    const processor = streamingProcessors.current.get(sessionId);
    if (processor) {
      processor.reset();
      streamingProcessors.current.delete(sessionId);
    }
  }, []);

  // Multiple streaming subscriptions - use fixed slots for concurrent sessions
  // Maximum 5 concurrent streaming sessions supported
  const activeSessions = Array.from(pendingMessages.entries());
  const MAX_CONCURRENT_STREAMS = 5;

  // Create fixed subscription slots
  const subscriptionSlots = Array.from({ length: MAX_CONCURRENT_STREAMS }, (_, i) => {
    const sessionEntry = activeSessions[i];
    return sessionEntry ? sessionEntry[1] : null;
  });

  // Subscription slot 0
  trpc.chat.sendMessageStream.useSubscription(
    subscriptionSlots[0]!,
    {
      enabled: !!subscriptionSlots[0],
      onData: handleStreamData,
      onError: () => subscriptionSlots[0] && handleStreamError(subscriptionSlots[0].sessionId),
    }
  );

  // Subscription slot 1
  trpc.chat.sendMessageStream.useSubscription(
    subscriptionSlots[1]!,
    {
      enabled: !!subscriptionSlots[1],
      onData: handleStreamData,
      onError: () => subscriptionSlots[1] && handleStreamError(subscriptionSlots[1].sessionId),
    }
  );

  // Subscription slot 2
  trpc.chat.sendMessageStream.useSubscription(
    subscriptionSlots[2]!,
    {
      enabled: !!subscriptionSlots[2],
      onData: handleStreamData,
      onError: () => subscriptionSlots[2] && handleStreamError(subscriptionSlots[2].sessionId),
    }
  );

  // Subscription slot 3
  trpc.chat.sendMessageStream.useSubscription(
    subscriptionSlots[3]!,
    {
      enabled: !!subscriptionSlots[3],
      onData: handleStreamData,
      onError: () => subscriptionSlots[3] && handleStreamError(subscriptionSlots[3].sessionId),
    }
  );

  // Subscription slot 4
  trpc.chat.sendMessageStream.useSubscription(
    subscriptionSlots[4]!,
    {
      enabled: !!subscriptionSlots[4],
      onData: handleStreamData,
      onError: () => subscriptionSlots[4] && handleStreamError(subscriptionSlots[4].sessionId),
    }
  );

  const handleSendMessage = useCallback(() => {
    if (!message.trim()) return;
    if (currentSessionId && isTypingPerSession.get(currentSessionId)) return;

    const userMessageContent = message;
    setMessage('');

    if (!currentSessionId) {
      createSessionWithMessageMutation.mutate({
        userId,
        firstMessage: userMessageContent,
      }, {
        onSuccess: (session) => {
          const sessionId = session.id;
          setCurrentSessionId(sessionId);
          
          // Initialize per-session state
          setIsTypingPerSession(prev => {
            const next = new Map(prev);
            next.set(sessionId, true);
            return next;
          });
          
          setStreamingMessages(prev => {
            const next = new Map(prev);
            next.set(sessionId, '');
            return next;
          });
          
          setTempUserMessages(prev => {
            const next = new Map(prev);
            next.set(sessionId, { content: userMessageContent, timestamp: new Date() });
            return next;
          });
          
          setPendingMessages(prev => {
            const next = new Map(prev);
            next.set(sessionId, {
              sessionId: sessionId,
              content: userMessageContent,
              userId,
            });
            return next;
          });
          
          setShouldStreamPerSession(prev => {
            const next = new Map(prev);
            next.set(sessionId, true);
            return next;
          });
          
          streamBuffers.current.set(sessionId, []);
          
          refetchSessions();
        },
        onError: () => {
          setMessage(userMessageContent);
        }
      });
    } else {
      const currentSession = sessions?.find((s: ChatSession) => s.id === currentSessionId);
      const isFirstMessage = currentSession && (
        currentSession.title === 'New Chat' || 
        currentSession.title.startsWith('New Chat')
      );
      
      // Initialize per-session state
      setIsTypingPerSession(prev => {
        const next = new Map(prev);
        next.set(currentSessionId, true);
        return next;
      });
      
      setStreamingMessages(prev => {
        const next = new Map(prev);
        next.set(currentSessionId, '');
        return next;
      });
      
      setTempUserMessages(prev => {
        const next = new Map(prev);
        next.set(currentSessionId, { content: userMessageContent, timestamp: new Date() });
        return next;
      });
      
      setPendingMessages(prev => {
        const next = new Map(prev);
        next.set(currentSessionId, {
          sessionId: currentSessionId,
          content: userMessageContent,
          userId,
        });
        return next;
      });
      
      setShouldStreamPerSession(prev => {
        const next = new Map(prev);
        next.set(currentSessionId, true);
        return next;
      });
      
      streamBuffers.current.set(currentSessionId, []);
      
      if (isFirstMessage) {
        setTimeout(() => {
          updateSessionTitleMutation.mutate({
            sessionId: currentSessionId,
            title: userMessageContent
          });
        }, 1000);
      }
    }
  }, [message, currentSessionId, userId, sessions, isTypingPerSession, createSessionWithMessageMutation, updateSessionTitleMutation, refetchSessions]);

  const handleStopResponse = useCallback(() => {
    if (!currentSessionId) return;
    
    const processor = streamingProcessors.current.get(currentSessionId);
    if (processor) {
      processor.reset();
      streamingProcessors.current.delete(currentSessionId);
    }
    
    setIsTypingPerSession(prev => {
      const next = new Map(prev);
      next.set(currentSessionId, false);
      return next;
    });
    
    setStreamingMessages(prev => {
      const next = new Map(prev);
      next.delete(currentSessionId);
      return next;
    });
    
    setTempUserMessages(prev => {
      const next = new Map(prev);
      next.delete(currentSessionId);
      return next;
    });
    
    setShouldStreamPerSession(prev => {
      const next = new Map(prev);
      next.delete(currentSessionId);
      return next;
    });
    
    setPendingMessages(prev => {
      const next = new Map(prev);
      next.delete(currentSessionId);
      return next;
    });
    
    streamBuffers.current.delete(currentSessionId);
    
    refetchMessages();
  }, [currentSessionId, refetchMessages]);

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
    activeStreamingSessions,
    sessions,
    messages,
    handleSendMessage,
    handleStopResponse,
    handleSelectQuickPrompt,
  };
}

