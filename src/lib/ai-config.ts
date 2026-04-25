/**
 * Production-grade AI Model Configuration
 * Centralized configuration for all NVIDIA API models
 */

import OpenAI from 'openai';

export interface ModelConfig {
  model: string;
  temperature: number;
  top_p: number;
  max_tokens: number;
  extra_body?: Record<string, unknown>;
  description?: string;
}

export interface AIProvider {
  name: string;
  client: OpenAI;
  model: string;
  config: ModelConfig;
}

/**
 * NVIDIA Model Configurations
 * Optimized for performance and reliability
 */
export const NVIDIA_MODELS: Record<string, ModelConfig> = {
  'mistral-large-3': {
    model: 'mistralai/mistral-large-3-675b-instruct-2512',
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 8192,
    extra_body: {},
    description: 'General purpose MoE LLM, excellent for chat and instruction-following'
  },
  'minimax-m2.7': {
    model: 'minimaxai/minimax-m2.7',
    temperature: 0.8,
    top_p: 0.95,
    max_tokens: 8192,
    extra_body: {},
    description: 'Fast coding and reasoning model (230B parameters)'
  },
  'kimi-k2-instruct': {
    model: 'moonshotai/kimi-k2-instruct-0905',
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 8192,
    extra_body: {},
    description: 'Enhanced reasoning with longer context window'
  },
  'qwen3.5-coder': {
    model: 'qwen/qwen3.5-coder-480b-a35b-instruct',
    temperature: 0.6,
    top_p: 0.95,
    max_tokens: 8192,
    extra_body: {},
    description: 'Specialized for agentic coding and browser use'
  },
  'mistral-medium-3': {
    model: 'mistralai/mistral-medium-3-instruct',
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 8192,
    extra_body: {},
    description: 'Multimodal model for enterprise applications'
  },
  'seed-csa-36b': {
    model: 'bytedance/seed-csa-36b-instruct',
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 8192,
    extra_body: {},
    description: 'ByteDance\'s efficient long-context model'
  },
  'deepseek-v4-pro': {
    model: 'deepseek-ai/deepseek-v4-pro',
    temperature: 1,
    top_p: 0.95,
    max_tokens: 16384,
    extra_body: {
      chat_template_kwargs: {
        thinking: true,
        reasoning_effort: 'high'
      }
    },
    description: 'Advanced reasoning with thinking capabilities'
  }
};

/**
 * Default model configuration
 */
export const DEFAULT_MODEL = 'mistral-large-3';

/**
 * System prompts for different contexts
 */
export const SYSTEM_PROMPTS = {
  CAREER_COUNSELOR: `You are a professional career counselor with expertise in helping people navigate their career paths. You provide thoughtful, personalized advice on:
  - Career exploration and planning
  - Skills assessment and development
  - Job search strategies
  - Interview preparation
  - Professional networking
  - Work-life balance
  - Career transitions
  - Industry insights and trends
  
  Always be encouraging, practical, and specific in your advice. Ask clarifying questions when needed to provide the most relevant guidance.`,

  TITLE_GENERATOR: 'Generate a concise, descriptive title (max 50 characters) for a chat session based on the user\'s first message. The title should capture the main topic or question. Return only the title, no quotes or extra text.'
};

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  NO_API_KEY: 'AI service is not configured. Please set up your NVIDIA API key to use this feature.',
  API_ERROR: 'I apologize, but I encountered an error while processing your request. Please try again.',
  NO_RESPONSE: 'I apologize, but I was unable to generate a response. Please try again.',
  UNKNOWN_MODEL: 'Unknown AI model selected.',
  SERVICE_UNAVAILABLE: 'AI service is temporarily unavailable. Please try again later.'
};

/**
 * Configuration validation
 */
export function validateModelConfig(modelKey: string): ModelConfig | null {
  const config = NVIDIA_MODELS[modelKey];
  if (!config) {
    console.error(`Unknown NVIDIA model: ${modelKey}. Available models: ${Object.keys(NVIDIA_MODELS).join(', ')}`);
    return null;
  }
  return config;
}

/**
 * Get available models list for UI/display
 */
export function getAvailableModels(): Array<{ key: string; config: ModelConfig }> {
  return Object.entries(NVIDIA_MODELS).map(([key, config]) => ({
    key,
    config
  }));
}
