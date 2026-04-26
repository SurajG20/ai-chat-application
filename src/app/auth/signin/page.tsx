'use client';

import { useState } from 'react';
import { AuthForm } from '@/components/auth/auth-form';

export default function SignIn() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/30 pointer-events-none" />
      <div className="w-full max-w-md relative z-10">
        <AuthForm mode={mode} onModeChange={setMode} />
      </div>
    </div>
  );
}