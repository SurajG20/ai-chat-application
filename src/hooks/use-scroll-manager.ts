'use client';

import { useState, useRef, useCallback, useEffect } from 'react';

interface UseScrollManagerReturn {
  isAtBottom: boolean;
  setIsAtBottom: (value: boolean) => void;
  scrollAreaRef: React.RefObject<HTMLDivElement | null>;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  scrollToBottom: () => void;
  checkIfAtBottom: () => void;
}

export function useScrollManager(): UseScrollManagerReturn {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const scrollToBottom = useCallback(() => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      if (messagesEndRef.current) {
        const scrollContainer = messagesEndRef.current.closest('[data-radix-scroll-area-viewport]');
        if (scrollContainer) {
          scrollContainer.scrollTo({
            top: scrollContainer.scrollHeight,
            behavior: 'smooth'
          });
        } else {
          messagesEndRef.current.scrollIntoView({ 
            behavior: 'smooth',
            block: 'nearest',
            inline: 'nearest'
          });
        }
      }
    }, 30);
  }, []);

  const checkIfAtBottom = useCallback(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer as HTMLElement;
      const threshold = 50;
      const isAtBottomNow = scrollHeight - scrollTop - clientHeight < threshold;
      setIsAtBottom(isAtBottomNow);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return {
    isAtBottom,
    setIsAtBottom,
    scrollAreaRef,
    messagesEndRef,
    scrollToBottom,
    checkIfAtBottom,
  };
}
