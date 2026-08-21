'use client';

import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { copyToClipboard, extractPlainText } from '../lib/message-formatter';
import { ToastContainer } from './ui/toast';
import { useToast } from '../hooks/use-toast';

// Hooks
import { useChat, useChatSessions, useScrollManager, useKeyboardShortcuts } from '../hooks';

// Components
import {
  ChatHeader,
  ChatSidebar,
  ChatMessageList,
  ChatInput,
  WelcomeScreen,
} from './chat';

// Types
import type { AccentColor } from '../types/chat';

interface ChatInterfaceProps {
  userId?: number;
}

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  
  // Theme state
  const [accentColor, setAccentColor] = useState<AccentColor>('#2563eb');
  const [resourceLibraryOpen, setResourceLibraryOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Chat hook for all chat logic
  const {
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
  } = useChat({
    userId,
    onMaxStreamsExceeded: () =>
      showError('Too many responses streaming. Wait for one to finish, then try again.', 3000),
  });

  // Sessions hook for session management
  const {
    createSession,
    requestDeleteSession,
    deleteDialog,
  } = useChatSessions({
    userId,
    onSessionChange: setCurrentSessionId,
  });

  // Scroll management
  const {
    isAtBottom,
    setIsAtBottom,
    scrollAreaRef,
    messagesEndRef,
    scrollToBottom,
  } = useScrollManager();

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onSendMessage: handleSendMessage,
    onStopResponse: handleStopResponse,
    onNewChat: () => createSession(),
    isTyping,
  });

  const handleCopyMessage = useCallback(async (content: string, isStreaming: boolean = false) => {
    const plainText = extractPlainText(content);
    const success = await copyToClipboard(plainText);
    
    if (success) {
      showSuccess(
        isStreaming ? 'Streaming response copied!' : 'Message copied to clipboard',
        2000
      );
    } else {
      showError('Failed to copy message', 3000);
    }
  }, [showSuccess, showError]);

  const handleNewChat = useCallback(() => {
    createSession();
    setSidebarOpen(false);
  }, [createSession]);

  const handleStartNewChat = useCallback(() => {
    createSession();
  }, [createSession]);

  const handleDeleteSession = useCallback((sessionId: number) => {
    requestDeleteSession(sessionId);
  }, [requestDeleteSession]);

  return (
    <div className="flex h-screen bg-background" data-accent-color={accentColor}>
      {/* Live tRPC subscriptions, one per active stream */}
      {streamManager}

      {/* Delete session confirmation */}
      {deleteDialog}

      {/* Sidebar */}
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        isCollapsed={sidebarCollapsed}
        isOpen={sidebarOpen}
        accentColor={accentColor}
        userName={session?.user?.name}
        userImage={session?.user?.image}
        activeStreamingSessions={activeStreamingSessions}
        onSessionSelect={setCurrentSessionId}
        onCreateSession={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onCloseMobileSidebar={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ml-0 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'} overflow-hidden border-l border-border`}>
        {/* Headers */}
        <ChatHeader
          sessions={sessions}
          currentSessionId={currentSessionId}
          accentColor={accentColor}
          resourceLibraryOpen={resourceLibraryOpen}
          isMobile={true}
          onToggleSidebar={() => setSidebarOpen(true)}
          onToggleResourceLibrary={() => setResourceLibraryOpen(!resourceLibraryOpen)}
          onAccentColorChange={setAccentColor}
        />
        <ChatHeader
          sessions={sessions}
          currentSessionId={currentSessionId}
          accentColor={accentColor}
          resourceLibraryOpen={resourceLibraryOpen}
          isMobile={false}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          onToggleResourceLibrary={() => setResourceLibraryOpen(!resourceLibraryOpen)}
          onAccentColorChange={setAccentColor}
        />

        {/* Chat content or Welcome screen */}
        {currentSessionId ? (
          <>
            <ChatMessageList
              messages={messages}
              tempUserMessage={tempUserMessage}
              streamingMessage={streamingMessage}
              isTyping={isTyping}
              accentColor={accentColor}
              isAtBottom={isAtBottom}
              scrollAreaRef={scrollAreaRef}
              messagesEndRef={messagesEndRef}
              onCopyMessage={handleCopyMessage}
              onScrollToBottom={scrollToBottom}
              setIsAtBottom={setIsAtBottom}
            />
            <ChatInput
              message={message}
              setMessage={setMessage}
              isTyping={isTyping}
              accentColor={accentColor}
              onSendMessage={handleSendMessage}
              onStopResponse={handleStopResponse}
            />
          </>
        ) : (
          <WelcomeScreen
            accentColor={accentColor}
            onStartNewChat={handleStartNewChat}
            onSelectQuickPrompt={handleSelectQuickPrompt}
          />
        )}
      </div>

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
