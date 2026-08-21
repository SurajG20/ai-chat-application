'use client';

import { memo, useCallback } from 'react';
import { Plus, Trash2, X, User } from 'lucide-react';
import { Button } from '../ui/button';
import { CardTitle } from '../ui/card';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { LogoutConfirmation } from '../logout-confirmation';
import type { ChatSession, AccentColor } from '../../types/chat';

interface ChatSidebarProps {
  sessions: ChatSession[] | undefined;
  currentSessionId: number | null;
  isCollapsed: boolean;
  isOpen: boolean;
  accentColor: AccentColor;
  userName?: string | null;
  userImage?: string | null;
  activeStreamingSessions: number[];
  onSessionSelect: (sessionId: number) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: number) => void;
  onCloseMobileSidebar: () => void;
}

// Memoized session item to prevent unnecessary re-renders
const SessionItem = memo(function SessionItem({
  session,
  isActive,
  isCollapsed,
  accentColor,
  isStreaming,
  onSelect,
  onDelete,
}: {
  session: ChatSession;
  isActive: boolean;
  isCollapsed: boolean;
  accentColor: AccentColor;
  isStreaming: boolean;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className={`group cursor-pointer transition-all duration-200 rounded-lg p-2 mx-1 ${
        isActive ? 'bg-primary/10 border border-primary/50' : 'hover:bg-muted'
      }`}
      onClick={onSelect}
      title={isCollapsed ? session.title : undefined}
    >
      <div className="flex items-center justify-between">
        {isCollapsed ? (
          <div className="w-full flex justify-center relative">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center" 
              style={{ backgroundColor: accentColor }}
            >
              <span className="text-xs font-medium text-primary-foreground">
                {session.title.charAt(0).toUpperCase()}
              </span>
            </div>
            {isStreaming && (
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: accentColor }}></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-background border border-border"></span>
              </span>
            )}
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {session.title}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-muted-foreground">
                  {new Date(session.updatedAt).toLocaleDateString()}
                </p>
                {isStreaming && (
                  <span className="flex items-center gap-1 text-xs" style={{ color: accentColor }}>
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: accentColor }}></span>
                      <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: accentColor }}></span>
                    </span>
                    <span className="text-xs">typing...</span>
                  </span>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-muted-foreground hover:text-destructive p-1 h-auto ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
});

export const ChatSidebar = memo(function ChatSidebar({
  sessions,
  currentSessionId,
  isCollapsed,
  isOpen,
  accentColor,
  userName,
  userImage,
  activeStreamingSessions,
  onSessionSelect,
  onCreateSession,
  onDeleteSession,
  onCloseMobileSidebar,
}: ChatSidebarProps) {
  const handleDelete = useCallback((sessionId: number) => (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
  }, [onDeleteSession]);

  const handleSelect = useCallback((sessionId: number) => () => {
    onSessionSelect(sessionId);
    onCloseMobileSidebar();
  }, [onSessionSelect, onCloseMobileSidebar]);

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onCloseMobileSidebar}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${isCollapsed ? 'w-16' : 'w-72'} bg-sidebar border-r border-sidebar-border flex flex-col fixed inset-y-0 left-0 z-50 lg:z-auto transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <CardTitle className="text-sm font-semibold text-sidebar-foreground">
              Chat History
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCloseMobileSidebar}
              className="p-2 text-sidebar-foreground hover:text-primary"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="hidden lg:flex items-center justify-between mb-4">
            {!isCollapsed && (
              <CardTitle className="text-sm font-semibold text-sidebar-foreground">
                Chat History
              </CardTitle>
            )}
          </div>
          
          <Button
            className={`w-full text-primary-foreground rounded-lg hover:opacity-90 transition-opacity ${isCollapsed ? 'px-2' : ''}`}
            style={{ backgroundColor: accentColor }}
            size={isCollapsed ? "icon" : "default"}
            onClick={onCreateSession}
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">New Chat</span>}
          </Button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {!isCollapsed && (
                <h3 className="text-xs font-medium text-muted-foreground mb-2 px-2 uppercase tracking-wider">
                  Recent Chats
                </h3>
              )}
              {sessions?.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={currentSessionId === session.id}
                  isCollapsed={isCollapsed}
                  accentColor={accentColor}
                  isStreaming={activeStreamingSessions.includes(session.id)}
                  onSelect={handleSelect(session.id)}
                  onDelete={handleDelete(session.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* User profile */}
        <div className="flex-shrink-0 p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={userImage || ''} />
              <AvatarFallback 
                className="text-xs text-primary-foreground" 
                style={{ backgroundColor: accentColor }}
              >
                {userName?.charAt(0) || <User className="h-3 w-3" />}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">
                    {userName}
                  </p>
                  <p className="text-xs text-muted-foreground">Career Seeker</p>
                </div>
                <LogoutConfirmation
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-sidebar-foreground p-1 h-auto"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
});
