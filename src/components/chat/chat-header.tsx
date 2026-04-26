'use client';

import { memo } from 'react';
import { Menu, Heart } from 'lucide-react';
import { Button } from '../ui/button';
import { ThemeToggle } from '../theme-toggle';
import { ThemeCustomizer } from '../theme-customizer';
import { ResourceLibrary } from '../resource-library';
import type { ChatSession, AccentColor } from '../../types/chat';

interface ChatHeaderProps {
  sessions: ChatSession[] | undefined;
  currentSessionId: number | null;
  accentColor: AccentColor;
  resourceLibraryOpen: boolean;
  isMobile?: boolean;
  onToggleSidebar: () => void;
  onToggleResourceLibrary: () => void;
  onAccentColorChange: (color: AccentColor) => void;
}

export const ChatHeader = memo(function ChatHeader({
  sessions,
  currentSessionId,
  accentColor,
  resourceLibraryOpen,
  isMobile = false,
  onToggleSidebar,
  onToggleResourceLibrary,
  onAccentColorChange,
}: ChatHeaderProps) {
  const currentSession = sessions?.find((s) => s.id === currentSessionId);
  const title = currentSession?.title || 'CareerPath AI';

  if (isMobile) {
    return (
      <div className="lg:hidden bg-[#131313] border-b border-white px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="p-2 text-white hover:text-[#3860be]"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-lg flex items-center justify-center" 
            style={{ backgroundColor: accentColor }}
          >
            <Heart className="h-3 w-3 text-black" />
          </div>
          <h2 className="font-display text-lg text-white truncate max-w-[200px]">
            {title}
          </h2>
        </div>
        <div className="w-9 flex justify-end gap-1">
          <ResourceLibrary
            isOpen={resourceLibraryOpen}
            onToggle={onToggleResourceLibrary}
            accentColor={accentColor}
          />
          <ThemeCustomizer onColorChange={onAccentColorChange} currentColor={accentColor} />
          <ThemeToggle />
        </div>
      </div>
    );
  }

  return (
    <div className="hidden lg:flex bg-[#131313] border-b border-white px-6 py-4 items-center justify-between relative z-10">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="p-2 text-white hover:text-[#3860be]"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-lg flex items-center justify-center" 
            style={{ backgroundColor: accentColor }}
          >
            <Heart className="h-3 w-3 text-black" />
          </div>
          <h2 className="font-display text-lg text-white">
            {title}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <ResourceLibrary
          isOpen={resourceLibraryOpen}
          onToggle={onToggleResourceLibrary}
          accentColor={accentColor}
        />
        <ThemeCustomizer onColorChange={onAccentColorChange} currentColor={accentColor} />
        <ThemeToggle />
      </div>
    </div>
  );
});
