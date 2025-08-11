import OpenAI from 'openai';

export function ensureOpenAIClient() {
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    const err = new Error('OpenAI not configured. Set OPENAI_API_KEY.');
    (err as any).code = 'NO_OPENAI_KEY';
    throw err;
  }
  return new OpenAI({ apiKey: key });
}


