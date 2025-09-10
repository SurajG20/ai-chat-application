'use client';

import { useState } from 'react';
import { AuthForm } from '@/components/auth/auth-form';

export default function SignUp() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signup');

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthForm mode={mode} onModeChange={setMode} />
      </div>
    </div>
  );
}
