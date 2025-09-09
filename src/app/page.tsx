'use client';

import { useSession } from 'next-auth/react';
import { ChatInterface } from '../components/chat-interface';
import { AuthButton } from '../components/auth-button';
import { ThemeToggle } from '../components/theme-toggle';

export default function Home() {
  const { data: session, status } = useSession();

  return (
    <div className="min-h-screen">
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Career Counseling Chat
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Get personalized career advice from our AI counselor
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </header>
      
      {status === 'loading' ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-300">Loading...</p>
          </div>
        </div>
      ) : session ? (
        <ChatInterface userId={parseInt((session.user as { id?: string })?.id || '0')} />
      ) : (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Welcome to Career Counseling Chat
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please sign in to start chatting with our AI career counselor
            </p>
            <AuthButton />
          </div>
        </div>
      )}
    </div>
  );
}
