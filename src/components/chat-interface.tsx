'use client';

import { useState, useRef, useEffect } from 'react';
import { trpc } from '../utils/trpc';
import { MessageCircle, Send, Plus, Trash2, Menu, X, Bot, User, Heart, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { useSession, signOut } from 'next-auth/react';
// import type { ChatSession, Message } from '../db/schema';

interface ChatInterfaceProps {
  userId?: number;
}

export function ChatInterface({ userId }: ChatInterfaceProps) {
  const { data: session } = useSession();
  const [currentSessionId, setCurrentSessionId] = useState<number | null>(null);
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const sendMessageMutation = trpc.chat.sendMessage.useMutation({
    onSuccess: () => {
      refetchMessages();
      setIsTyping(false);
    },
    onError: () => {
      setIsTyping(false);
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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!message.trim() || !currentSessionId) return;

    setIsTyping(true);
    setMessage('');

    await sendMessageMutation.mutateAsync({
      sessionId: currentSessionId,
      content: message,
      userId,
    });
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
    }
  };

  const handleDeleteSession = (sessionId: number) => {
    if (confirm('Are you sure you want to delete this chat session?')) {
      deleteSessionMutation.mutate({ sessionId });
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed Position */}
      <div className={`w-72 bg-card border-r border-border flex flex-col fixed inset-y-0 left-0 z-50 lg:z-auto transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} transition-transform duration-300 ease-in-out shadow-lg`}>
        {/* Fixed Header */}
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
          
          {/* New Chat Dialog */}
          <Dialog open={isNewChatDialogOpen} onOpenChange={setIsNewChatDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                New Chat
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-2 space-y-1">
              <h3 className="text-sm font-medium text-muted-foreground mb-2 px-2">Recent Chats</h3>
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
                >
                  <div className="flex items-center justify-between">
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
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* User Info and Logout - Fixed at Bottom */}
        <div className="flex-shrink-0 p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <Avatar className="w-7 h-7">
              <AvatarImage src={session?.user?.image || ''} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {session?.user?.name?.charAt(0) || <User className="h-3 w-3" />}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user?.name}</p>
              <p className="text-xs text-muted-foreground">Career Seeker</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-foreground p-1 h-auto"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col ml-72 lg:ml-72">
        {/* Mobile Header */}
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
            <h2 className="text-lg font-semibold">
              {sessions?.find((s) => s.id === currentSessionId)?.title || 'CareerPath AI'}
            </h2>
          </div>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>
        {currentSessionId ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-hidden">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                {messages?.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <Avatar className="w-8 h-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div className={`flex flex-col gap-1 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
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
                
                {isTyping && (
                  <div className="flex gap-3 justify-start">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <Card className="bg-card border-border">
                      <CardContent className="px-2 py-1">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>

            {/* Message Input - Fixed at Bottom */}
            <div className="flex-shrink-0 border-t border-border p-6 bg-card">
              <div className="max-w-6xl mx-auto">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about your career goals, skills, or get advice..."
                    className="flex-1"
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
                <p className="text-xs text-muted-foreground mt-2 text-center">
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

