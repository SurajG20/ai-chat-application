'use client';

import { useCallback } from 'react';
import { trpc } from '../utils/trpc';
import type { ChatSession } from '../types/chat';

interface UseChatSessionsProps {
  userId?: number;
  onSessionChange?: (sessionId: number | null) => void;
}

interface UseChatSessionsReturn {
  sessions: ChatSession[] | undefined;
  isLoading: boolean;
  createSession: (title?: string) => void;
  deleteSession: (sessionId: number) => void;
  isCreating: boolean;
  isDeleting: boolean;
}

export function useChatSessions({ userId, onSessionChange }: UseChatSessionsProps): UseChatSessionsReturn {
  const { data: sessions, isLoading, refetch: refetchSessions } = trpc.chat.getSessions.useQuery(
    { userId },
    { enabled: !!userId }
  );

  const createSessionMutation = trpc.chat.createSession.useMutation({
    onSuccess: (session) => {
      refetchSessions();
      onSessionChange?.(session.id);
    },
  });

  const deleteSessionMutation = trpc.chat.deleteSession.useMutation({
    onSuccess: (_, variables) => {
      // Find next available session
      if (sessions && sessions.length > 0) {
        const remainingSessions = sessions.filter((s: ChatSession) => s.id !== variables.sessionId);
        const nextSessionId = remainingSessions.length > 0 ? remainingSessions[0].id : null;
        onSessionChange?.(nextSessionId);
      } else {
        onSessionChange?.(null);
      }
      refetchSessions();
    },
  });

  const createSession = useCallback((title: string = 'New Chat') => {
    createSessionMutation.mutate({
      userId,
      title,
    });
  }, [userId, createSessionMutation]);

  const deleteSession = useCallback((sessionId: number) => {
    if (confirm('Are you sure you want to delete this chat session?')) {
      deleteSessionMutation.mutate({ sessionId });
    }
  }, [deleteSessionMutation]);

  return {
    sessions,
    isLoading,
    createSession,
    deleteSession,
    isCreating: createSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
  };
}
