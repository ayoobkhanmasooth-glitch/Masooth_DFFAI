import Anthropic from '@anthropic-ai/sdk';

// Prompts live on the server so the endpoint can't be used as an open proxy.
const client = new Anthropic(); // reads ANTHROPIC_API_KEY from Vercel env

const MODEL = 'claude-opus-5';
const BETAS = ['server-side-fallback-2026-07-01'];

const SYSTEMS = {
  business: `You are a concept-prototype "Business Services Assistant" for UAE economy and tourism services.
Help investors, SMEs and entrepreneurs understand typical steps for: company setup and licensing,
trademarks and intellectual property, commercial agencies, consumer rights, SME support programmes,
and tourism business licensing / hotel classification.
Rules:
- Reply in the same language the user writes in (Arabic or English).
- Give clear numbered steps, list documents usually needed, and say which authority typically handles it
  (federal ministry vs. local economic department vs. free zone).
- You are a prototype: never invent fees, timelines or legal article numbers. When specifics matter,
  tell the user to confirm on the official government portal.
- Keep answers under 250 words.`,

  complaint: `You triage consumer complaints for a UAE consumer-protection team (concept prototype).
Classify the complaint and draft a short acknowledgement for the consumer.
The complaint may be in Arabic or English. Write summary_en in English and summary_ar in Arabic.
Set urgency "high" for safety risks, large financial loss, or suspected widespread fraud.`,
};

const COMPLAINT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['category', 'sector', 'urgency', 'suggested_team', 'summary_en', 'summary_ar', 'reply_to_consumer', 'red_flags'],
  properties: {
    category: {
      type: 'string',
      enum: ['Refund / exchange', 'Misleading advertising', 'Price manipulation', 'Warranty / after-sales',
             'Counterfeit goods', 'E-commerce delivery', 'Tourism / hotel service', 'Other'],
    },
    sector: { type: 'string' },
    urgency: { type: 'string', enum: ['low', 'medium', 'high'] },
    suggested_team: { type: 'string' },
    summary_en: { type: 'string' },
    summary_ar: { type: 'string' },
    reply_to_consumer: { type: 'string' },
    red_flags: { type: 'array', items: { type: 'string' } },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { mode, messages, text } = req.body || {};

  try {
    if (mode === 'business') {
      if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
        return res.status(400).json({ error: 'messages must be a non-empty array (max 30)' });
      }
      const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 4000,
        betas: BETAS,
        fallbacks: 'default',
        output_config: { effort: 'low' },
        system: SYSTEMS.business,
        messages: messages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: String(m.content).slice(0, 4000),
        })),
      });
      if (response.stop_reason === 'refusal') {
        return res.status(200).json({ reply: 'Sorry, I can’t help with that request.' });
      }
      const reply = response.content.filter(b => b.type === 'text').map(b => b.text).join('\n');
      return res.status(200).json({ reply });
    }

    if (mode === 'complaint') {
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'text is required' });
      }
      const response = await client.beta.messages.create({
        model: MODEL,
        max_tokens: 4000,
        betas: BETAS,
        fallbacks: 'default',
        output_config: {
          effort: 'low',
          format: { type: 'json_schema', schema: COMPLAINT_SCHEMA },
        },
        system: SYSTEMS.complaint,
        messages: [{ role: 'user', content: text.slice(0, 6000) }],
      });
      if (response.stop_reason === 'refusal') {
        return res.status(422).json({ error: 'The complaint could not be processed.' });
      }
      const raw = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
      return res.status(200).json({ result: JSON.parse(raw) });
    }

    return res.status(400).json({ error: 'mode must be "business" or "complaint"' });
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Too many requests, please retry shortly.' });
    }
    if (error instanceof Anthropic.APIError) {
      return res.status(502).json({ error: `AI service error (${error.status})` });
    }
    return res.status(500).json({ error: 'Server error', detail: error.message });
  }
}
