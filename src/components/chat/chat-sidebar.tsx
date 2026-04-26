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
  onSessionSelect: (sessionId: number) => void;
  onCreateSession: () => void;
  onDeleteSession: (sessionId: number) => void;
  _onToggleSidebar: () => void;
  onCloseMobileSidebar: () => void;
}

// Memoized session item to prevent unnecessary re-renders
const SessionItem = memo(function SessionItem({
  session,
  isActive,
  isCollapsed,
  accentColor,
  onSelect,
  onDelete,
}: {
  session: ChatSession;
  isActive: boolean;
  isCollapsed: boolean;
  accentColor: AccentColor;
  onSelect: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      className={`cursor-pointer transition-all duration-200 rounded-[20px] p-2 mx-1 ${
        isActive ? 'border' : 'hover:bg-[#2d2d2d]'
      }`}
      style={isActive ? { backgroundColor: `${accentColor}10`, borderColor: accentColor } : undefined}
      onClick={onSelect}
      title={isCollapsed ? session.title : undefined}
    >
      <div className="flex items-center justify-between">
        {isCollapsed ? (
          <div className="w-full flex justify-center">
            <div 
              className="w-8 h-8 rounded-full flex items-center justify-center" 
              style={{ backgroundColor: accentColor }}
            >
              <span className="text-xs font-medium text-black">
                {session.title.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {session.title}
              </p>
              <p className="label-mono-sm text-[#949494] text-xs">
                {new Date(session.updatedAt).toLocaleDateString()}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-[#949494] hover:text-[#5200ff] p-1 h-auto ml-1"
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
  onSessionSelect,
  onCreateSession,
  onDeleteSession,
  _onToggleSidebar,
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
      <div className={`${isCollapsed ? 'w-16' : 'w-72'} bg-[#131313] border-r border-white flex flex-col fixed inset-y-0 left-0 z-50 lg:z-auto transform ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-all duration-300 ease-in-out`}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-white">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <CardTitle className="text-lg font-semibold text-white label-mono-sm">
              CHAT HISTORY
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCloseMobileSidebar}
              className="p-2 text-white hover:text-[#3860be]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="hidden lg:flex items-center justify-between mb-4">
            {!isCollapsed && (
              <CardTitle className="text-lg font-semibold text-white label-mono-sm">
                CHAT HISTORY
              </CardTitle>
            )}
          </div>
          
          <Button
            className={`w-full text-black rounded-full border-none label-mono ${isCollapsed ? 'px-2' : ''}`}
            style={{ backgroundColor: accentColor }}
            size={isCollapsed ? "icon" : "lg"}
            onClick={onCreateSession}
          >
            <Plus className="w-4 h-4" />
            {!isCollapsed && <span className="ml-2">NEW CHAT</span>}
          </Button>
        </div>

        {/* Session list */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {!isCollapsed && (
                <h3 className="label-mono-sm text-[#949494] text-xs mb-2 px-2">
                  RECENT CHATS
                </h3>
              )}
              {sessions?.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={currentSessionId === session.id}
                  isCollapsed={isCollapsed}
                  accentColor={accentColor}
                  onSelect={handleSelect(session.id)}
                  onDelete={handleDelete(session.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* User profile */}
        <div className="flex-shrink-0 p-3 border-t border-white">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src={userImage || ''} />
              <AvatarFallback 
                className="text-black text-xs" 
                style={{ backgroundColor: accentColor }}
              >
                {userName?.charAt(0) || <User className="h-3 w-3" />}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {userName}
                  </p>
                  <p className="label-mono-sm text-[#949494] text-xs">CAREER SEEKER</p>
                </div>
                <LogoutConfirmation
                  variant="ghost"
                  size="sm"
                  className="text-[#949494] hover:text-white p-1 h-auto"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
});
