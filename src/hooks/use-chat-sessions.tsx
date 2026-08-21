'use client';

import { useCallback, useState } from 'react';
import { trpc } from '../utils/trpc';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import type { ChatSession } from '../types/chat';

interface UseChatSessionsProps {
  userId?: number;
  onSessionChange?: (sessionId: number | null) => void;
}

interface UseChatSessionsReturn {
  sessions: ChatSession[] | undefined;
  isLoading: boolean;
  createSession: (title?: string) => void;
  requestDeleteSession: (sessionId: number) => void;
  isCreating: boolean;
  isDeleting: boolean;
  deleteDialog: React.ReactNode;
}

export function useChatSessions({ userId, onSessionChange }: UseChatSessionsProps): UseChatSessionsReturn {
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  const { data: sessions, isLoading, refetch: refetchSessions } = trpc.chat.getSessions.useQuery(undefined, {
    enabled: !!userId,
  });

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
    onSettled: () => setPendingDeleteId(null),
  });

  const createSession = useCallback((title: string = 'New Chat') => {
    createSessionMutation.mutate({ title });
  }, [createSessionMutation]);

  const requestDeleteSession = useCallback((sessionId: number) => {
    setPendingDeleteId(sessionId);
  }, []);

  const pendingDeleteSession = sessions?.find((s: ChatSession) => s.id === pendingDeleteId);

  const deleteDialog = (
    <AlertDialog open={pendingDeleteId !== null} onOpenChange={(open) => !open && setPendingDeleteId(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this chat?</AlertDialogTitle>
          <AlertDialogDescription>
            {pendingDeleteSession
              ? `"${pendingDeleteSession.title}" and all of its messages will be permanently deleted. This cannot be undone.`
              : 'This chat and all of its messages will be permanently deleted. This cannot be undone.'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => pendingDeleteId !== null && deleteSessionMutation.mutate({ sessionId: pendingDeleteId })}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );

  return {
    sessions,
    isLoading,
    createSession,
    requestDeleteSession,
    isCreating: createSessionMutation.isPending,
    isDeleting: deleteSessionMutation.isPending,
    deleteDialog,
  };
}
