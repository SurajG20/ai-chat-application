'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { trpc } from '../utils/trpc';
import { Send, Plus, Trash2, Menu, X, Bot, User, Heart, LogOut, ArrowDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useSession } from 'next-auth/react';
import { ThemeToggle } from './theme-toggle';
import { LogoutConfirmation } from './logout-confirmation';

interface ChatInterfaceProps {
  userId?: number;
}

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const { data: session } = useSession();
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
      setStreamingMessage(prev => prev + chars);
      
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
            setStreamingMessage(prev => prev + remaining);
            streamBufferRef.current = [];
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
      },
    }
  );

  const handleSendMessage = () => {
    if (!message.trim() || !currentSessionId) return;

    const userMessageContent = message;
    setMessage('');
    setIsTyping(true);
    setStreamingMessage('');
    
    setTempUserMessage({ 
      content: userMessageContent, 
      timestamp: new Date() 
    });

    setPendingMessage({
      sessionId: currentSessionId,
      content: userMessageContent,
      userId,
    });
    setShouldStream(true);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const [newChatTitle, setNewChatTitle] = useState('');
  const [isNewChatDialogOpen, setIsNewChatDialogOpen] = useState(false);

  const handleNewChat = () => {
    if (newChatTitle.trim()) {
      createSessionMutation.mutate({
        userId,
        title: newChatTitle.trim(),
      });
      setNewChatTitle('');
      setIsNewChatDialogOpen(false);
      setSidebarOpen(false); // Close mobile sidebar after creating new chat
    }
  };

  const handleDeleteSession = (sessionId: number) => {
    if (confirm('Are you sure you want to delete this chat session?')) {
      deleteSessionMutation.mutate({ sessionId });
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-72'} bg-card border-r border-border flex flex-col fixed inset-y-0 left-0 z-50 lg:z-auto transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-all duration-300 ease-in-out shadow-lg`}>
        <div className="flex-shrink-0 p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4 lg:hidden">
            <CardTitle className="text-lg font-semibold">Chat History</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="hidden lg:flex items-center justify-between mb-4">
            {!sidebarCollapsed && <CardTitle className="text-lg font-semibold">Chat History</CardTitle>}
          </div>
          <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
            <DialogTrigger asChild>
              <Button className={`w-full ${sidebarCollapsed ? 'px-2' : ''}`} size={sidebarCollapsed ? "icon" : "lg"}>
                <Plus className="w-4 h-4" />
                {!sidebarCollapsed && <span className="ml-2">New Chat</span>}
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Start New Chat Session</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Enter a title for your chat session..."
                  value={newChatTitle}
                  onChange={(e) => setNewChatTitle(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleNewChat()}
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setIsNewChatDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleNewChat} disabled={!newChatTitle.trim()}>
                    Create Chat
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              {!sidebarCollapsed && <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Recent Chats</h3>}
              {sessions?.map((session) => (
                <div
                  key={session.id}
                  className={`cursor-pointer transition-all duration-200 rounded-lg p-2 mx-1 ${
                    currentSessionId === session.id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-muted/50'
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
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary">
                            {session.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {session.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
                          className="text-muted-foreground hover:text-destructive p-1 h-auto ml-1"
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

        <div className="flex-shrink-0 p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {session?.user?.name?.charAt(0) || <User className="h-3 w-3" />}
              </AvatarFallback>
            </Avatar>
            {!sidebarCollapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{session?.user?.name}</p>
                  <p className="text-xs text-muted-foreground">Career Seeker</p>
                </div>
                <LogoutConfirmation
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-foreground p-1 h-auto"
                />
              </>
            )}
          </div>
        </div>

      </div>

      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ml-0 ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-72'} overflow-hidden`}>
        <div className="lg:hidden bg-card border-b border-border px-4 py-3 flex items-center justify-between shadow-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
            className="p-2"
          >
            <Menu className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Heart className="h-3 w-3 text-primary-foreground" />
            </div>
            <h2 className="text-lg font-semibold truncate max-w-[200px]">
              {sessions?.find((s) => s.id === currentSessionId)?.title || 'CareerPath AI'}
            </h2>
          </div>
          <div className="w-9 flex justify-end">
            <ThemeToggle />
          </div>
        </div>

        <div className="hidden lg:flex bg-card border-b border-border px-6 py-4 items-center justify-between shadow-sm relative z-10">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2 hover:bg-muted/50"
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Heart className="h-3 w-3 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-semibold">
                {sessions?.find((s) => s.id === currentSessionId)?.title || 'CareerPath AI'}
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
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 lg:gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex flex-col gap-1 max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                      <Card className={`${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-card border-border'
                      }`}>
                        <CardContent className="px-2 py-1">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {msg.content}
                          </p>
                        </CardContent>
                      </Card>
                      <p className="text-xs text-muted-foreground px-1">
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    {msg.role === 'user' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-accent/10 text-accent">
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {tempUserMessage && (
                  <div className="flex gap-2 lg:gap-3 justify-end message-fade-in">
                    <div className="flex flex-col gap-1 max-w-[80%] items-end">
                      <Card className="bg-primary text-primary-foreground gpu-accelerated">
                        <CardContent className="px-2 py-1">
                          <p className="text-sm whitespace-pre-wrap leading-relaxed">
                            {tempUserMessage.content}
                          </p>
                        </CardContent>
                      </Card>
                      <p className="text-xs text-muted-foreground px-1">
                        {tempUserMessage.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-accent/10 text-accent">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                )}
                
                {(isTyping || streamingMessage) && (
                  <div className="flex gap-3 justify-start message-fade-in">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <Card className="bg-card border-border max-w-[80%] gpu-accelerated">
                      <CardContent className="px-2 py-1">
                        {streamingMessage ? (
                          <p className="text-sm whitespace-pre-wrap leading-relaxed streaming-text">
                            {streamingMessage}
                            <span className="inline-block w-1 h-4 ml-0.5 bg-primary/60 streaming-cursor" />
                          </p>
                        ) : (
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        )}
                      </CardContent>
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
                  className="absolute bottom-4 right-4 z-10 rounded-full shadow-lg bg-primary/90 hover:bg-primary"
                  aria-label="Scroll to bottom"
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              )}
            </div>

            <div className="flex-shrink-0 border-t border-border p-4 lg:p-6 bg-card">
              <div className="max-w-6xl mx-auto">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your career goals, skills, or get advice..."
                    className="flex-1 text-sm lg:text-base"
                    disabled={isTyping}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim() || isTyping}
                    size="icon"
                    className="shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 text-center hidden lg:block">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8">
            <Card className="max-w-2xl mx-auto text-center">
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold mb-3">
                  Welcome to CareerPath AI
                </h2>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Start a new conversation to get personalized career advice, skill assessments, and strategic guidance from our AI counselor.
                </p>
                <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Start New Chat
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Start New Chat Session</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        placeholder="Enter a title for your chat session..."
                        value={newChatTitle}
                        onChange={(e) => setNewChatTitle(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleNewChat()}
                      />
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setIsNewChatDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleNewChat} disabled={!newChatTitle.trim()}>
                          Create Chat
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}


