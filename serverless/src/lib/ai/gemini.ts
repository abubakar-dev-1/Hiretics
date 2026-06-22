import { GoogleGenerativeAI } from '@google/generative-ai';
import type { AiProvider, AnalyzeInput, AssistInput, AssistResult, CvAnalysis } from './types';
import { buildPrompt, parseAnalysis, buildAssistPrompt, parseAssist } from './prompt';

function model() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  return genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-2.5-flash' });
}

/** Free fallback provider (set AI_PROVIDER=gemini). */
export const geminiProvider: AiProvider = {
  name: 'gemini',
  async analyze(input: AnalyzeInput): Promise<CvAnalysis> {
    const result = await model().generateContent(buildPrompt(input));
    return parseAnalysis(result.response.text());
  },

  async assist(input: AssistInput): Promise<AssistResult> {
    const result = await model().generateContent(buildAssistPrompt(input));
    return parseAssist(result.response.text(), input.action);
  },
};
