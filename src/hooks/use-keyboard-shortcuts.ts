'use client';

import { useCallback, useEffect } from 'react';

interface KeyboardShortcutsConfig {
  onSendMessage?: () => void;
  onStopResponse?: () => void;
  onNewChat?: () => void;
  disabled?: boolean;
  isTyping?: boolean;
}

export function useKeyboardShortcuts({
  onSendMessage,
  onStopResponse,
  onNewChat,
  disabled = false,
  isTyping = false,
}: KeyboardShortcutsConfig) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled) return;

    // Cmd/Ctrl + Enter to send
    if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
      if (onSendMessage) {
        e.preventDefault();
        onSendMessage();
      }
    }

    // Escape to stop response
    if (e.key === 'Escape' && isTyping && onStopResponse) {
      e.preventDefault();
      onStopResponse();
    }

    // Cmd/Ctrl + N for new chat
    if (e.key === 'n' && (e.metaKey || e.ctrlKey) && onNewChat) {
      e.preventDefault();
      onNewChat();
    }
  }, [disabled, isTyping, onSendMessage, onStopResponse, onNewChat]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}
