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
      <div className="lg:hidden bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="p-2 text-foreground hover:text-primary"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div 
            className="w-7 h-7 rounded-lg flex items-center justify-center" 
            style={{ backgroundColor: accentColor }}
          >
            <Heart className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <h2 className="font-display text-base text-foreground truncate max-w-[200px]">
            {title}
          </h2>
        </div>
        <div className="flex items-center gap-1">
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
    <div className="hidden lg:flex bg-background border-b border-border px-6 py-3 items-center justify-between relative z-10">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="p-2 text-foreground hover:text-primary"
        >
          <Menu className="w-5 h-5" />
        </Button>
        <div className="flex items-center gap-2">
          <div 
            className="w-6 h-6 rounded-md flex items-center justify-center" 
            style={{ backgroundColor: accentColor }}
          >
            <Heart className="h-3 w-3 text-primary-foreground" />
          </div>
          <h2 className="font-display text-base text-foreground">
            {title}
          </h2>
        </div>
      </div>
      <div className="flex items-center gap-1">
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
