'use client';

import { useState, useRef, useCallback } from 'react';
import { trpc } from '../utils/trpc';
import type {
  ChatMessage,
  ChatSession,
  SendMessageInput,
  TempUserMessage,
  StreamData,
} from '../types/chat';

interface UseChatProps {
  userId?: number;
  onMaxStreamsExceeded?: () => void;
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

  // Render this to mount one live subscription per active stream
  streamManager: React.ReactNode;
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

interface StreamSlotProps {
  input: SendMessageInput;
  onData: (data: StreamData) => void;
  onError: (sessionId: number) => void;
}

// One component instance = one live tRPC subscription. Rendering N of these
// supports N concurrent streams without hardcoded hook slots.
function StreamSlot({ input, onData, onError }: StreamSlotProps) {
  trpc.chat.sendMessageStream.useSubscription(input, {
    onData,
    onError: () => onError(input.sessionId),
  });
  return null;
}

export function useChat({ userId, onMaxStreamsExceeded }: UseChatProps): UseChatReturn {
  // Cap on simultaneously streaming sessions (each holds a live subscription)
  const MAX_CONCURRENT_STREAMS = 3;

  // Core state
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  // Per-session streaming state using Maps
  const [isTypingPerSession, setIsTypingPerSession] = useState<Map<number, boolean>>(new Map());
  const [streamingMessages, setStreamingMessages] = useState<Map<number, string>>(new Map());
  const [tempUserMessages, setTempUserMessages] = useState<Map<number, TempUserMessage>>(new Map());
  const [pendingMessages, setPendingMessages] = useState<Map<number, SendMessageInput>>(new Map());

  // Per-session refs using Maps
  const streamBuffers = useRef<Map<number, string[]>>(new Map());
  const streamingProcessors = useRef<Map<number, StreamingProcessor>>(new Map());

  // Derived state for current session
  const isTyping = currentSessionId ? (isTypingPerSession.get(currentSessionId) ?? false) : false;
  const streamingMessage = currentSessionId ? (streamingMessages.get(currentSessionId) ?? '') : '';
  const tempUserMessage = currentSessionId ? (tempUserMessages.get(currentSessionId) ?? null) : null;
  const activeStreamingSessions = Array.from(pendingMessages.keys());

  // Data fetching
  const { data: sessions, refetch: refetchSessions } = trpc.chat.getSessions.useQuery(undefined, {
    enabled: !!userId,
  });

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

  // Clear all per-session stream state (streaming text, temp message, pending
  // subscription input, typing flag, buffer)
  const clearSessionState = useCallback((sessionId: number) => {
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
    setPendingMessages(prev => {
      const next = new Map(prev);
      next.delete(sessionId);
      return next;
    });
    setIsTypingPerSession(prev => {
      const next = new Map(prev);
      next.set(sessionId, false);
      return next;
    });
    streamBuffers.current.delete(sessionId);
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
        clearSessionState(sessionId);

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
        clearSessionState(sessionId);

        if (sessionId === currentSessionId) {
          refetchMessages();
        }
      }, 2000);
    }
  }, [currentSessionId, refetchMessages, processStreamBuffer, clearSessionState]);

  // Handle stream error for a specific session
  const handleStreamError = useCallback((sessionId: number) => {
    const processor = streamingProcessors.current.get(sessionId);
    if (processor) {
      processor.reset();
      streamingProcessors.current.delete(sessionId);
    }

    clearSessionState(sessionId);
  }, [clearSessionState]);

  // One live subscription per active stream, mounted wherever streamManager renders
  const activeStreams = Array.from(pendingMessages.entries());
  const streamManager = (
    <>
      {activeStreams.map(([sessionId, input]) => (
        <StreamSlot
          key={sessionId}
          input={input}
          onData={handleStreamData}
          onError={handleStreamError}
        />
      ))}
    </>
  );

  const handleSendMessage = useCallback(() => {
    if (!message.trim()) return;
    if (currentSessionId && isTypingPerSession.get(currentSessionId)) return;

    // Respect the concurrent-stream cap; give the user their text back
    if (pendingMessages.size >= MAX_CONCURRENT_STREAMS) {
      onMaxStreamsExceeded?.();
      return;
    }

    const userMessageContent = message;
    setMessage('');

    if (!currentSessionId) {
      createSessionWithMessageMutation.mutate({
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
            });
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
        });
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
  }, [message, currentSessionId, sessions, isTypingPerSession, pendingMessages.size, MAX_CONCURRENT_STREAMS, onMaxStreamsExceeded, createSessionWithMessageMutation, updateSessionTitleMutation, refetchSessions]);

  const handleStopResponse = useCallback(() => {
    if (!currentSessionId) return;

    const processor = streamingProcessors.current.get(currentSessionId);
    if (processor) {
      processor.reset();
      streamingProcessors.current.delete(currentSessionId);
    }

    clearSessionState(currentSessionId);

    refetchMessages();
  }, [currentSessionId, refetchMessages, clearSessionState]);

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
    streamManager,
  };
}
