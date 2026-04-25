/**
 * Production-grade AI Service
 * Handles all AI operations with proper error handling and logging
 */

import OpenAI from 'openai';
import { DEFAULT_MODEL, validateModelConfig, SYSTEM_PROMPTS, ERROR_MESSAGES, type ModelConfig, type AIProvider } from './ai-config';

/**
 * AI Service Class
 * Centralized AI operations with error handling
 */
export class AIService {
  private client: OpenAI | null = null;
  private currentModel: string;
  private currentConfig: ModelConfig | null = null;

  constructor() {
    this.currentModel = DEFAULT_MODEL;
    this.initializeClient();
  }

  /**
   * Initialize the AI client with environment configuration
   */
  private initializeClient(): void {
    const apiKey = process.env.NVIDIA_API_KEY;
    
    if (!apiKey) {
      console.warn('NVIDIA_API_KEY not found in environment');
      return;
    }

    try {
      this.client = new OpenAI({
        baseURL: 'https://integrate.api.nvidia.com/v1',
        apiKey: apiKey,
      });

      const selectedModel = process.env.NVIDIA_MODEL || DEFAULT_MODEL;
      this.setModel(selectedModel);
      
      console.log(`✅ AI Service initialized with model: ${this.currentModel}`);
    } catch (error) {
      console.error('❌ Failed to initialize AI client:', error);
      this.client = null;
    }
  }

  /**
   * Set the AI model
   */
  public setModel(modelKey: string): boolean {
    const config = validateModelConfig(modelKey);
    if (!config) {
      return false;
    }

    this.currentModel = modelKey;
    this.currentConfig = config;
    return true;
  }

  /**
   * Get current AI provider information
   */
  public getProvider(): AIProvider | null {
    if (!this.client || !this.currentConfig) {
      return null;
    }

    return {
      name: 'nvidia',
      client: this.client,
      model: this.currentConfig.model,
      config: this.currentConfig
    };
  }

  /**
   * Check if AI service is available
   */
  public isAvailable(): boolean {
    return this.client !== null && this.currentConfig !== null;
  }

  /**
   * Generate chat title from first message
   */
  public async generateChatTitle(firstMessage: string): Promise<string> {
    console.log('🎯 Generating title for message:', firstMessage.substring(0, 50) + '...');
    
    if (!this.isAvailable()) {
      console.log('⚠️ AI service not available, using fallback title generation');
      return this.generateFallbackTitle(firstMessage);
    }

    try {
      console.log('🤖 Attempting AI title generation with model:', this.currentModel);
      
      const completion = await this.client!.chat.completions.create({
        model: this.currentConfig!.model,
        messages: [
          {
            role: 'system' as const,
            content: SYSTEM_PROMPTS.TITLE_GENERATOR
          },
          {
            role: 'user' as const,
            content: firstMessage
          }
        ],
        max_tokens: 20,
        temperature: 0.7,
        ...this.currentConfig!.extra_body
      });

      const title = completion.choices[0]?.message?.content?.trim();
      
      if (title && title.length > 0) {
        console.log('✅ AI generated title:', title);
        return title;
      } else {
        console.log('⚠️ AI returned empty title, using fallback');
        return this.generateFallbackTitle(firstMessage);
      }
    } catch (error) {
      console.error('❌ Error generating chat title:', error);
      return this.generateFallbackTitle(firstMessage);
    }
  }

  /**
   * Generate AI response for chat message
   */
  public async generateResponse(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    maxTokens?: number
  ): Promise<string> {
    if (!this.isAvailable()) {
      throw new Error(ERROR_MESSAGES.NO_API_KEY);
    }

    try {
      const completion = await this.client!.chat.completions.create({
        model: this.currentConfig!.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPTS.CAREER_COUNSELOR
          },
          ...messages
        ],
        max_tokens: maxTokens || Math.min(this.currentConfig!.max_tokens, 500),
        temperature: this.currentConfig!.temperature,
        top_p: this.currentConfig!.top_p,
        ...this.currentConfig!.extra_body
      });

      const response = completion.choices[0]?.message?.content?.trim();
      return response || ERROR_MESSAGES.NO_RESPONSE;
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw new Error(ERROR_MESSAGES.API_ERROR);
    }
  }

  /**
   * Generate streaming AI response
   */
  public async *generateStreamingResponse(
    messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
    maxTokens?: number
  ): AsyncGenerator<{ content: string; reasoning?: string }, void, unknown> {
    if (!this.isAvailable()) {
      yield { content: ERROR_MESSAGES.NO_API_KEY };
      return;
    }

    try {
      const stream = await this.client!.chat.completions.create({
        model: this.currentConfig!.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPTS.CAREER_COUNSELOR
          },
          ...messages
        ],
        max_tokens: maxTokens || Math.min(this.currentConfig!.max_tokens, 500),
        temperature: this.currentConfig!.temperature,
        top_p: this.currentConfig!.top_p,
        stream: true,
        ...this.currentConfig!.extra_body
      });

      for await (const chunk of stream) {
        const delta = chunk.choices[0]?.delta;
        const content = delta?.content || '';
        
        // Handle reasoning content for models that support it
        const reasoning = (delta as { reasoning?: string; reasoning_content?: string })?.reasoning || 
                         (delta as { reasoning?: string; reasoning_content?: string })?.reasoning_content || undefined;
        
        if (content || reasoning) {
          yield { content, reasoning };
        }
      }
    } catch (error) {
      console.error('Error in streaming response:', error);
      yield { content: ERROR_MESSAGES.API_ERROR };
    }
  }

  /**
   * Generate fallback title when AI is unavailable
   */
  private generateFallbackTitle(message: string): string {
    // Remove common prefixes and clean up the message
    const cleanedMessage = message
      .replace(/^(hi|hello|hey|help|can you|could you|please|i need|i want|i'm looking for)\s+/i, '')
      .replace(/[!?.,;:]$/g, '')
      .trim();
    
    const words = cleanedMessage.split(' ').filter(word => word.length > 0);
    
    if (words.length === 0) {
      return 'New Chat';
    }
    
    // Take first 3-5 words, aiming for reasonable length
    const titleWords = words.slice(0, Math.min(4, words.length));
    let title = titleWords.join(' ');
    
    // Capitalize first letter of each word
    title = title.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
    
    // Add ellipsis if we truncated
    if (words.length > 4) {
      title += '...';
    }
    
    // Ensure title is not too long
    if (title.length > 50) {
      title = title.substring(0, 47) + '...';
    }
    
    return title || 'New Chat';
  }

  /**
   * Get current model information
   */
  public getCurrentModelInfo(): { key: string; config: ModelConfig } | null {
    if (!this.currentConfig) {
      return null;
    }

    return {
      key: this.currentModel,
      config: this.currentConfig
    };
  }
}

/**
 * Singleton AI service instance
 */
export const aiService = new AIService();
