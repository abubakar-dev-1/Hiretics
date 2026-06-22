import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * JSON chat entry point for the career-analysis engine (ported from RoleNorth).
 * Honours the shared AI_PROVIDER env: openai (default) | gemini.
 * The `mock` provider is handled by the callers (deterministic, offline) and
 * never reaches here.
 */
export interface ChatRequest {
  system: string;
  user: string;
  temperature?: number;
}

export async function chatJSON({ system, user, temperature = 0.4 }: ChatRequest): Promise<string> {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase();

  if (provider === 'gemini') {
    if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured.');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      systemInstruction: system,
      generationConfig: { temperature, responseMimeType: 'application/json' },
    });
    const result = await model.generateContent(user);
    return result.response.text();
  }

  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured.');
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    temperature,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  const text = response.choices[0]?.message?.content || '';
  if (!text) throw new Error('OpenAI returned an empty response.');
  return text;
}

export function safeParseJSON<T = unknown>(text: string): T | null {
  try {
    const cleaned = text
      .replace(/^[\s\S]*?```(?:json)?\s*/i, '')
      .replace(/\s*```[\s\S]*$/i, '')
      .trim();
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) return null;
    return JSON.parse(cleaned.slice(start, end + 1)) as T;
  } catch {
    return null;
  }
}

export const isMockAi = () => (process.env.AI_PROVIDER || 'openai').toLowerCase() === 'mock';
