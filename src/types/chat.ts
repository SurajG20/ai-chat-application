/**
 * Chat-related TypeScript types and interfaces
 * Centralized type definitions for the chat system
 */

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: number;
  role: MessageRole | string;
  content: string;
  createdAt: string | Date;
  sessionId: number;
}

export interface ChatSession {
  id: number;
  title: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  userId: number | null;
}

export interface NewChatSession {
  userId?: number;
  title: string;
}

export interface SendMessageInput {
  sessionId: number;
  content: string;
  userId?: number;
}

export interface StreamData {
  type: 'chunk' | 'complete' | 'error';
  content?: string;
  messageId?: number;
  sessionId?: number;
}

export interface TempUserMessage {
  content: string;
  timestamp: Date;
}

export interface QuickPromptData {
  id: string;
  label: string;
  prompt: string;
  category: string;
}

export type AccentColor = string;
