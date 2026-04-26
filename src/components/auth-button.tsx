'use client';

import { useSession, signIn } from 'next-auth/react';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { LogIn, User } from 'lucide-react';
import { LogoutConfirmation } from './logout-confirmation';

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-[#2d2d2d] rounded-full animate-pulse"></div>
        <span className="text-[#949494] text-sm">Loading...</span>
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
            <AvatarImage src={session.user?.image || ''} />
            <AvatarFallback className="bg-[#3cffd0] text-black text-xs sm:text-sm">
              {session.user?.name?.charAt(0) || <User className="h-3 w-3 sm:h-4 sm:w-4" />}
            </AvatarFallback>
          </Avatar>
          <div className="hidden md:block">
            <div className="text-sm font-medium text-white">{session.user?.name}</div>
            <div className="label-mono-sm text-[#949494] text-xs">CAREER SEEKER</div>
          </div>
        </div>
        <LogoutConfirmation
          variant="ghost"
          size="sm"
          className="text-[#949494] hover:text-white p-2 sm:px-3"
          showText={true}
        />
      </div>
    );
  }

  return (
    <Button
      onClick={() => signIn(undefined, { callbackUrl: '/chat' })}
      className="bg-[#3cffd0] hover:bg-[rgba(255,255,255,0.2)] text-black px-3 sm:px-4 rounded-full border-none label-mono"
    >
      <LogIn className="w-4 h-4 sm:mr-2" />
      <span className="hidden sm:inline">SIGN IN</span>
    </Button>
  );
}
