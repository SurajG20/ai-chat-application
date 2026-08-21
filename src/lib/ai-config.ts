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
 * Verified live against integrate.api.nvidia.com — retire and re-verify
 * when NVIDIA rotates checkpoints (a 410 from the API means a model is gone).
 */
export const NVIDIA_MODELS: Record<string, ModelConfig> = {
  'kimi-k3': {
    model: 'moonshotai/kimi-k3',
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 8192,
    extra_body: {
      chat_template_kwargs: {
        thinking: false,
      },
    },
    description: 'Fast, high-quality general chat (thinking disabled for snappy replies)'
  },
  'gpt-oss-120b': {
    model: 'openai/gpt-oss-120b',
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 8192,
    extra_body: {
      reasoning_effort: 'low',
    },
    description: 'OpenAI open-weight model with light reasoning'
  },
  'nemotron-super-49b': {
    model: 'nvidia/llama-3.3-nemotron-super-49b-v1.5',
    temperature: 0.7,
    top_p: 0.95,
    max_tokens: 16384,
    extra_body: {},
    description: 'NVIDIA reasoning model for deeper, more structured advice'
  },
};

/**
 * Default model configuration
 */
export const DEFAULT_MODEL = 'kimi-k3';

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

  TITLE_GENERATOR: 'Generate a concise chat session title of at most 8 words based on the user\'s first message. Capture the main topic or question. Return only the title, with no quotes and no extra text.'
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
