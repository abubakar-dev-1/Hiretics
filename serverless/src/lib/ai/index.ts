import type { AiProvider } from './types';
import { openaiProvider } from './openai';
import { geminiProvider } from './gemini';
import { mockProvider } from './mock';

export * from './types';

/**
 * Selects the AI provider from the AI_PROVIDER env var (openai | gemini | mock).
 * One env flip swaps providers — including `mock` for fully offline runs.
 */
export function getAiProvider(): AiProvider {
  switch ((process.env.AI_PROVIDER || 'openai').toLowerCase()) {
    case 'mock':
      return mockProvider;
    case 'gemini':
      return geminiProvider;
    case 'openai':
    default:
      return openaiProvider;
  }
}
