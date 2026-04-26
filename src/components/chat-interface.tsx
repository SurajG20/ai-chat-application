'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { trpc } from '../utils/trpc';
import { Send, Plus, Trash2, Menu, X, Bot, User, Heart, ArrowDown, Square, Copy } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSession } from 'next-auth/react';
import { ThemeToggle } from './theme-toggle';
import { LogoutConfirmation } from './logout-confirmation';
import { formatMessageContent, copyToClipboard, extractPlainText, StreamingProcessor } from '../lib/message-formatter';
import { ToastContainer } from './ui/toast';
import { useToast } from '../hooks/use-toast';

interface ChatInterfaceProps {
  userId?: number;
}

interface ChatSession {
  id: number;
  title: string;
  updatedAt: string;
  userId: number | null;
}

interface ChatMessage {
  id: number;
  role: string;
  content: string;
  createdAt: string;
  sessionId: number;
}

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const { toasts, removeToast, showSuccess, showError } = useToast();
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [tempUserMessage, setTempUserMessage] = useState<{ content: string; timestamp: Date } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const streamBufferRef = useRef<string[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const streamingProcessorRef = useRef<StreamingProcessor | null>(null);

  const { data: sessions, refetch: refetchSessions } = trpc.chat.getSessions.useQuery(
    { userId },
    { enabled: !!userId }
  );

  const { data: messages, refetch: refetchMessages } = trpc.chat.getMessages.useQuery(
    { sessionId: currentSessionId! },
    { enabled: !!currentSessionId }
  );

  const createSessionMutation = trpc.chat.createSession.useMutation({
    onSuccess: (session) => {
      setCurrentSessionId(session.id);
      refetchSessions();
    },
  });

  const createSessionWithMessageMutation = trpc.chat.createSessionWithMessage.useMutation({
    onSuccess: (session) => {
      setCurrentSessionId(session.id);
      refetchSessions();
      setSidebarOpen(false); // Close mobile sidebar after creating new chat
    },
  });


  const deleteSessionMutation = trpc.chat.deleteSession.useMutation({
    onSuccess: () => {
      if (sessions && sessions.length > 0) {
        setCurrentSessionId(sessions[0].id);
      } else {
        setCurrentSessionId(null);
      }
      refetchSessions();
    },
  });

  const updateSessionTitleMutation = trpc.chat.updateSessionTitle.useMutation({
    onSuccess: () => {
      refetchSessions();
    },
  });

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

  const [isAtBottom, setIsAtBottom] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const checkIfAtBottom = useCallback(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
      const threshold = 50;
      const isAtBottomNow = scrollHeight - scrollTop - clientHeight < threshold;
      setIsAtBottom(isAtBottomNow);
    }
  }, []);

  useEffect(() => {
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, tempUserMessage, scrollToBottom, isAtBottom]);

  useEffect(() => {
    if (streamingMessage) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(() => {
        scrollToBottom();
        setIsAtBottom(true);
      });
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [streamingMessage, scrollToBottom]);

  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
    if (scrollContainer) {
      const handleScroll = () => {
        checkIfAtBottom();
      };
      
      scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, [checkIfAtBottom]);

  useEffect(() => {
    // Add global copy code function
    (window as Window & { copyCode?: (button: HTMLButtonElement) => Promise<void> }).copyCode = async (button: HTMLButtonElement) => {
      const codeBlock = button.closest('.code-block');
      const codeElement = codeBlock?.querySelector('code');
      if (codeElement) {
        const codeText = codeElement.textContent || '';
        const success = await copyToClipboard(codeText);
        if (success) {
          const originalText = button.innerHTML;
          button.innerHTML = '✓ Copied';
          button.style.color = 'hsl(var(--success))';
          setTimeout(() => {
            button.innerHTML = originalText;
            button.style.color = '';
          }, 2000);
        }
      }
    };

    return () => {
      delete (window as Window & { copyCode?: (button: HTMLButtonElement) => Promise<void> }).copyCode;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (currentSessionId && messages && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom();
        setIsAtBottom(true);
      }, 100);
    }
  }, [currentSessionId, messages, scrollToBottom]);

  const [shouldStream, setShouldStream] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<{ sessionId: number; content: string; userId?: number } | null>(null);

  const processStreamBuffer = useCallback(() => {
    if (streamBufferRef.current.length > 0) {
      const charsToAdd = Math.min(3, streamBufferRef.current.length);
      const chars = streamBufferRef.current.splice(0, charsToAdd).join('');
      
      // Use streaming processor for smoother output
      if (!streamingProcessorRef.current) {
        streamingProcessorRef.current = new StreamingProcessor((text) => {
          setStreamingMessage(text);
        });
      }
      
      streamingProcessorRef.current.addChunk(chars);
      
      if (streamBufferRef.current.length > 0) {
        requestAnimationFrame(processStreamBuffer);
      }
    }
  }, []);

  trpc.chat.sendMessageStream.useSubscription(
    pendingMessage!,
    {
      enabled: shouldStream && !!pendingMessage,
      onData: (data) => {
        if (data.type === 'chunk' && data.content) {
          streamBufferRef.current.push(...data.content.split(''));
          processStreamBuffer();
        } else if (data.type === 'complete') {
          if (streamBufferRef.current.length > 0) {
            const remaining = streamBufferRef.current.join('');
            if (streamingProcessorRef.current) {
              streamingProcessorRef.current.addChunk(remaining);
            }
            streamBufferRef.current = [];
          }
          
          // Complete the streaming processor
          if (streamingProcessorRef.current) {
            streamingProcessorRef.current.complete();
            streamingProcessorRef.current = null;
          }
          
          setTimeout(() => {
            setStreamingMessage('');
            setTempUserMessage(null);
            setIsTyping(false);
            setShouldStream(false);
            setPendingMessage(null);
            refetchMessages();
          }, 100);
        } else if (data.type === 'error') {
          streamBufferRef.current = [];
          setStreamingMessage(data.content || 'An error occurred');
          setIsTyping(false);
          setTimeout(() => {
            setStreamingMessage('');
            setTempUserMessage(null);
            setShouldStream(false);
            setPendingMessage(null);
            refetchMessages();
          }, 2000);
        }
      },
      onError: () => {
        streamBufferRef.current = [];
        setIsTyping(false);
        setStreamingMessage('');
        setTempUserMessage(null);
        setShouldStream(false);
        setPendingMessage(null);
        if (streamingProcessorRef.current) {
          streamingProcessorRef.current = null;
        }
      },
    }
  );

  const handleSendMessage = () => {
    if (!message.trim() || isTyping) return;

    const userMessageContent = message;
    setMessage('');
    setIsTyping(true);
    setStreamingMessage('');
    
    setTempUserMessage({ 
      content: userMessageContent, 
      timestamp: new Date() 
    });

    // If no session exists, create one with auto-generated title
    if (!currentSessionId) {
      createSessionWithMessageMutation.mutate({
        userId,
        firstMessage: userMessageContent,
      }, {
        onSuccess: (session) => {
          setCurrentSessionId(session.id);
          setPendingMessage({
            sessionId: session.id,
            content: userMessageContent,
            userId,
          });
          setShouldStream(true);
          refetchSessions(); // Refresh sessions to show updated title
        },
        onError: () => {
          setIsTyping(false);
          setTempUserMessage(null);
          setMessage(userMessageContent); // Restore message on error
        }
      });
    } else {
      // Check if this is the first message in a "New Chat" session
      const currentSession = sessions?.find((s: ChatSession) => s.id === currentSessionId);
      const isFirstMessage = currentSession && (
        currentSession.title === 'New Chat' || 
        currentSession.title.startsWith('New Chat')
      );
      
      setPendingMessage({
        sessionId: currentSessionId,
        content: userMessageContent,
        userId,
      });
      setShouldStream(true);
      
      // If this is the first message in a "New Chat" session, generate a better title
      if (isFirstMessage) {
        // We'll update the title after the message is successfully sent
        setTimeout(() => {
          updateSessionTitleMutation.mutate({
            sessionId: currentSessionId,
            title: userMessageContent // This will be processed by AI to generate a proper title
          });
        }, 1000);
      }
    }
  };

  const handleCopyMessage = async (content: string, isStreaming: boolean = false) => {
    const plainText = extractPlainText(content);
    const success = await copyToClipboard(plainText);
    
    if (success) {
      showSuccess(
        isStreaming ? 'Streaming response copied!' : 'Message copied to clipboard',
        2000
      );
    } else {
      showError('Failed to copy message', 3000);
    }
  };

  const handleStopResponse = () => {
    // Cancel streaming processor
    if (streamingProcessorRef.current) {
      streamingProcessorRef.current = null;
    }
    
    setIsTyping(false);
    setStreamingMessage('');
    setTempUserMessage(null);
    setShouldStream(false);
    setPendingMessage(null);
    refetchMessages();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  
  const handleNewChat = () => {
    // Create a new session with a default title
    createSessionMutation.mutate({
      userId,
      title: 'New Chat',
    });
    setSidebarOpen(false); // Close mobile sidebar after creating new chat
  };

  const handleStartNewChat = () => {
    // Create a new session and immediately focus on the message input
    createSessionMutation.mutate({
      userId,
      title: 'New Chat',
    });
  };

  const handleDeleteSession = (sessionId: number) => {
    if (confirm('Are you sure you want to delete this chat session?')) {
      deleteSessionMutation.mutate({ sessionId });
    }
  };

  return (
    <div className="flex h-screen bg-[#131313]">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-[#131313] border-r border-white flex flex-col fixed inset-y-0 left-0 z-50 lg:z-auto transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-all duration-300 ease-in-out`}>
        <div className="flex-shrink-0 p-4 border-b border-white">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <CardTitle className="text-lg font-semibold text-white label-mono-sm">CHAT HISTORY</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="p-2 text-white hover:text-[#3860be]"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="hidden lg:flex items-center justify-between mb-4">
            {!sidebarCollapsed && <CardTitle className="text-lg font-semibold text-white label-mono-sm">CHAT HISTORY</CardTitle>}
          </div>
          <Button 
              className={`w-full bg-[#3cffd0] hover:bg-[rgba(255,255,255,0.2)] text-black rounded-full border-none label-mono ${sidebarCollapsed ? 'px-2' : ''}`} 
              size={sidebarCollapsed ? "icon" : "lg"}
              onClick={handleNewChat}
            >
              <Plus className="w-4 h-4" />
              {!sidebarCollapsed && <span className="ml-2">NEW CHAT</span>}
            </Button>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {!sidebarCollapsed && <h3 className="label-mono-sm text-[#949494] text-xs mb-2 px-2">RECENT CHATS</h3>}
              {sessions?.map((session: ChatSession) => (
                <div
                  key={session.id}
                  className={`cursor-pointer transition-all duration-200 rounded-[20px] p-2 mx-1 ${
                    currentSessionId === session.id
                      ? 'bg-[#3cffd0]/10 border border-[#3cffd0]'
                      : 'hover:bg-[#2d2d2d]'
                  }`}
                  onClick={() => {
                    setCurrentSessionId(session.id);
                    setSidebarOpen(false);
                  }}
                  title={sidebarCollapsed ? session.title : undefined}
                >
                  <div className="flex items-center justify-between">
                    {sidebarCollapsed ? (
                      <div className="w-full flex justify-center">
                        <div className="w-8 h-8 bg-[#3cffd0] rounded-full flex items-center justify-center">
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
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSession(session.id);
                          }}
                          className="text-[#949494] hover:text-[#5200ff] p-1 h-auto ml-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        <div className="flex-shrink-0 p-3 border-t border-white">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="bg-[#3cffd0] text-black text-xs">
                {session?.user?.name?.charAt(0) || <User className="h-3 w-3" />}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
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

      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ml-0 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'} overflow-hidden`}>
        <div className="lg:hidden bg-[#131313] border-b border-white px-4 py-3 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-white hover:text-[#3860be]"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#3cffd0] rounded-lg flex items-center justify-center">
              <Heart className="h-3 w-3 text-black" />
            </div>
            <h2 className="font-display text-lg text-white truncate max-w-[200px]">
              {sessions?.find((s: ChatSession) => s.id === currentSessionId)?.title || 'CareerPath AI'}
            </h2>
          </div>
          <div className="w-9 flex justify-end">
            <ThemeToggle />
          </div>
        </div>

        <div className="hidden lg:flex bg-[#131313] border-b border-white px-6 py-4 items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 text-white hover:text-[#3860be]"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-[#3cffd0] rounded-lg flex items-center justify-center">
                <Heart className="h-3 w-3 text-black" />
              </div>
              <h2 className="font-display text-lg text-white">
                {sessions?.find((s: ChatSession) => s.id === currentSessionId)?.title || 'CareerPath AI'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
        {currentSessionId ? (
          <>
            <div className="flex-1 overflow-hidden relative">
              <ScrollArea ref={scrollAreaRef} className="h-full">
                <div className="px-4 py-3 lg:px-6 lg:py-4 space-y-3 lg:space-y-4">
                {messages?.map((msg: ChatMessage) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 lg:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-[#3cffd0] text-black">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <Card className={`${
                        msg.role === 'user'
                          ? 'bg-[#3cffd0] text-black'
                          : 'bg-[#131313] border-white'
                      } rounded-[20px]`}>
                        <CardContent className="px-3 py-2">
                          <div 
                            className="text-sm whitespace-pre-wrap leading-relaxed message-content"
                            dangerouslySetInnerHTML={{ 
                              __html: msg.role === 'assistant' 
                                ? formatMessageContent(msg.content) 
                                : msg.content 
                            }}
                          />
                        </CardContent>
                      </Card>
                      {msg.role === 'assistant' && (
                        <div className="flex items-center justify-between w-full px-1">
                          <p className="label-mono-sm text-[#949494] text-xs">
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-70 hover:opacity-100 transition-opacity p-1 h-auto text-[#949494] hover:text-white"
                            onClick={() => handleCopyMessage(msg.content)}
                            title="Copy message"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            <span className="text-xs label-mono-sm">COPY</span>
                          </Button>
                        </div>
                      )}
                      {msg.role === 'user' && (
                        <p className="label-mono-sm text-[#949494] text-xs px-1">
                          {new Date(msg.createdAt).toLocaleTimeString()}
                        </p>
                      )}
                    </div>

                    {msg.role === 'user' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-[#5200ff] text-white">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {tempUserMessage && (
                  <div className="flex gap-2 lg:gap-3 justify-end message-fade-in">
                    <div className="flex flex-col gap-1 max-w-[80%] items-end">
                      <Card className="bg-[#3cffd0] text-black rounded-[20px] gpu-accelerated">
                        <CardContent className="px-2 py-1">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {tempUserMessage.content}
                          </p>
                        </CardContent>
                      </Card>
                      <p className="label-mono-sm text-[#949494] text-xs px-1">
                        {tempUserMessage.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-[#5200ff] text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                
                {(isTyping || streamingMessage) && (
                  <div className="flex gap-3 justify-start message-fade-in">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-[#3cffd0] text-black">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <Card className="bg-[#131313] border-white rounded-[20px] max-w-[80%] gpu-accelerated">
                      <CardContent className="px-3 py-2">
                        {streamingMessage ? (
                          <div 
                            className="text-sm whitespace-pre-wrap leading-relaxed streaming-text message-content"
                            dangerouslySetInnerHTML={{ 
                              __html: formatMessageContent(streamingMessage) 
                            }}
                          >
                            <span className="inline-block w-1 h-4 ml-0.5 bg-primary/60 streaming-cursor" />
                          </div>
                        ) : (
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-[#3cffd0] rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-[#3cffd0] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-[#3cffd0] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        )}
                      </CardContent>
                      {streamingMessage && (
                        <div className="flex items-center justify-between w-full px-1 pt-1">
                          <p className="label-mono-sm text-[#949494] text-xs">
                            STREAMING...
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-70 hover:opacity-100 transition-opacity p-1 h-auto text-[#949494] hover:text-white"
                            onClick={() => handleCopyMessage(streamingMessage, true)}
                            title="Copy streaming message"
                          >
                            <Copy className="w-3 h-3 mr-1" />
                            <span className="text-xs label-mono-sm">COPY</span>
                          </Button>
                        </div>
                      )}
                    </Card>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {!isAtBottom && (
                <Button
                  onClick={() => {
                    scrollToBottom();
                    setIsAtBottom(true);
                  }}
                  size="icon"
                  className="absolute bottom-4 right-4 z-10 rounded-full bg-[#3cffd0] hover:bg-[rgba(255,255,255,0.2)] text-black"
                  aria-label="Scroll to bottom"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex-shrink-0 border-t border-white p-4 lg:p-6 bg-[#131313]">
              <div className="max-w-6xl mx-auto">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={isTyping ? "AI is responding... You can type your next message" : "Ask about your career goals, skills, or get advice..."}
                    className="flex-1 text-sm lg:text-base bg-[#2d2d2d] border-white text-white placeholder:text-[#949494] rounded-[4px]"
                  />
                  <Button
                    onClick={isTyping ? handleStopResponse : handleSendMessage}
                    disabled={!message.trim() && !isTyping}
                    size="icon"
                    className="shrink-0 bg-[#3cffd0] hover:bg-[rgba(255,255,255,0.2)] text-black rounded-full border-none"
                    title={isTyping ? "Stop response" : "Send message"}
                  >
                    {isTyping ? <Square className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="label-mono-sm text-[#949494] text-xs mt-2 text-center hidden lg:block">
                  PRESS ENTER TO SEND, SHIFT+ENTER FOR NEW LINE
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="max-w-2xl mx-auto text-center bg-[#131313] border-white rounded-[24px]">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-[#3cffd0] rounded-[20px] flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-black" />
                </div>
                <h2 className="font-display text-2xl text-white mb-3">
                  Welcome to CareerPath AI
                </h2>
                <p className="text-[#949494] mb-6 leading-relaxed">
                  Start a new conversation to get personalized career advice, skill assessments, and strategic guidance from our AI counselor.
                </p>
                <Button size="lg" className="w-full bg-[#3cffd0] hover:bg-[rgba(255,255,255,0.2)] text-black rounded-full border-none label-mono" onClick={handleStartNewChat}>
                  <Plus className="w-4 h-4 mr-2" />
                  START NEW CHAT
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}


