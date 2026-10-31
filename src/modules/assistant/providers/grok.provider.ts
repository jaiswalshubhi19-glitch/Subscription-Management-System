import { env } from '../../../config/env.js';
import { logger } from '../../../utils/logger.js';
import { AIProvider } from './ai-provider.interface.js';

export class GrokProvider implements AIProvider {
  name = 'Grok (xAI)';

  isConfigured(): boolean {
    return Boolean(env.GROK_API_KEY && env.GROK_API_KEY.trim().length > 0);
  }

  async generateExplanation(
    question: string,
    verifiedContext: Record<string, unknown>
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Grok API key is not configured');
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000); // 12s timeout

    try {
      const response = await fetch(`${env.GROK_API_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${env.GROK_API_KEY}`,
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: env.GROK_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You are the SubscriptIQ Executive Business Assistant. Your role is strictly to explain and summarize verified business and financial metrics provided in the context.\n' +
                'RULES:\n' +
                '1. Use only the provided verified context. Do not invent or recalculate financial totals.\n' +
                '2. Clearly distinguish between verified metrics and advice or insights.\n' +
                '3. Be concise, professional, and actionable.',
            },
            {
              role: 'user',
              content: `Context:\n${JSON.stringify(verifiedContext, null, 2)}\n\nQuestion: ${question}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`Grok API returned HTTP status ${response.status}`);
      }

      const data = (await response.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };

      const content = data.choices?.[0]?.message?.content;
      if (!content) {
        throw new Error('Empty response from Grok API');
      }

      return content.trim();
    } catch (error) {
      logger.warn('Grok API invocation failed, falling back to mock provider', error);
      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }
}
