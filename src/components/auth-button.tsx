'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogIn, LogOut, User } from 'lucide-react';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse"></div>
        <span className="text-muted-foreground text-sm">Loading...</span>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
            <AvatarImage src={session.user?.image || ''} />
            <AvatarFallback className="bg-primary/10 text-primary text-xs sm:text-sm">
              {session.user?.name?.charAt(0) || <User className="h-3 w-3 sm:h-4 sm:w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-foreground">{session.user?.name}</div>
            <div className="text-xs text-muted-foreground">Career Seeker</div>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut()}
          className="text-muted-foreground hover:text-foreground p-2 sm:px-3"
        >
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden lg:inline">Sign Out</span>
        </Button>
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn()}
      className="bg-primary hover:bg-primary/90 text-primary-foreground px-3 sm:px-4"
    >
      <LogIn className="w-4 h-4 sm:mr-2" />
      <span className="hidden sm:inline">Sign In</span>
    </Button>
  );
}
