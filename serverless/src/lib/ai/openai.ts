import OpenAI from 'openai';
import type { AiProvider, AnalyzeInput, AssistInput, AssistResult, CvAnalysis } from './types';
import { buildPrompt, parseAnalysis, buildAssistPrompt, parseAssist } from './prompt';

function client() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
const MODEL = () => process.env.OPENAI_MODEL || 'gpt-4o-mini';

/** Default provider. Uses JSON mode so the model reliably returns parseable JSON. */
export const openaiProvider: AiProvider = {
  name: 'openai',
  async analyze(input: AnalyzeInput): Promise<CvAnalysis> {
    const res = await client().chat.completions.create({
      model: MODEL(),
      temperature: 0.2,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: buildPrompt(input) }],
    });
    return parseAnalysis(res.choices[0]?.message?.content ?? '{}');
  },

  async assist(input: AssistInput): Promise<AssistResult> {
    const res = await client().chat.completions.create({
      model: MODEL(),
      temperature: 0.5,
      response_format: { type: 'json_object' },
      messages: [{ role: 'user', content: buildAssistPrompt(input) }],
    });
    return parseAssist(res.choices[0]?.message?.content ?? '{}', input.action);
  },
};
