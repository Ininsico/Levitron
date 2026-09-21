const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';
const REQUEST_TIMEOUT_MS = 60000;

export function isAiConfigured() {
  return Boolean(process.env.AI_API_KEY);
}

export function aiModelName() {
  return process.env.AI_MODEL || DEFAULT_MODEL;
}

function systemPrompt(kind) {
  if (kind === 'deck') {
    return [
      'You build presentation outlines for working professionals.',
      'Reply with JSON only, no prose, matching exactly this shape:',
      '{"title": string, "slides": [{"heading": string, "bullets": string[], "notes": string}]}',
      'Rules:',
      '- The first slide is a title slide; its heading is the deck title.',
      '- Every slide has 3 to 4 bullets. Each bullet is under 12 words, concrete, and free of filler.',
      '- "notes" is one or two sentences of speaker guidance.',
      '- Never invent statistics, dates, prices or quotes. Refer to metrics qualitatively instead.',
      '- No bullet may repeat another slide\u2019s heading.',
    ].join('\n');
  }

  return [
    'You write short internal business documents.',
    'Reply with JSON only, no prose, matching exactly this shape:',
    '{"title": string, "sections": [{"heading": string, "paragraphs": string[]}]}',
    'Rules:',
    '- Use 6 to 8 sections, each with 2 to 3 paragraphs of one to three sentences.',
    '- Write in plain, direct English. No marketing language, no filler.',
    '- Never invent statistics, dates, prices or quotes.',
    '- End with a section stating a clear recommendation or next step.',
  ].join('\n');
}

function userPrompt({ topic, kind, audience, tone, slideCount }) {
  const lines = [
    kind === 'deck' ? 'Write a presentation outline for:' : 'Write a document about:',
    topic,
    '',
    kind === 'deck' ? `Slide count: ${slideCount}` : 'Length: concise, roughly two pages',
  ];

  if (audience) lines.push(`Audience: ${audience}`);
  if (tone) lines.push(`Tone: ${tone}`);

  return lines.join('\n');
}

function cleanText(value, max) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function normalizeDeck(parsed, { topic, slideCount }) {
  const slides = Array.isArray(parsed?.slides) ? parsed.slides : [];

  const cleaned = slides
    .map((slide) => ({
      heading: cleanText(slide?.heading, 200),
      bullets: (Array.isArray(slide?.bullets) ? slide.bullets : [])
        .map((bullet) => cleanText(bullet, 300))
        .filter(Boolean)
        .slice(0, 6),
      notes: cleanText(slide?.notes, 2000),
    }))
    .filter((slide) => slide.heading);

  if (!cleaned.length) {
    throw new Error('The model returned no usable slides.');
  }

  const wanted = Math.max(4, Math.min(30, Number(slideCount) || 10));

  return {
    title: cleanText(parsed?.title, 160) || cleanText(topic, 160),
    source: 'ai',
    model: aiModelName(),
    slides: cleaned.slice(0, wanted),
    sections: [],
  };
}

function normalizeDocument(parsed, { topic }) {
  const sections = Array.isArray(parsed?.sections) ? parsed.sections : [];

  const cleaned = sections
    .map((section) => ({
      heading: cleanText(section?.heading, 200),
      paragraphs: (Array.isArray(section?.paragraphs) ? section.paragraphs : [])
        .map((paragraph) => cleanText(paragraph, 2000))
        .filter(Boolean)
        .slice(0, 5),
    }))
    .filter((section) => section.heading);

  if (!cleaned.length) {
    throw new Error('The model returned no usable sections.');
  }

  return {
    title: cleanText(parsed?.title, 160) || cleanText(topic, 160),
    source: 'ai',
    model: aiModelName(),
    slides: [],
    sections: cleaned,
  };
}

export async function generateWithAi(input) {
  const baseUrl = (process.env.AI_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: aiModelName(),
      temperature: 0.6,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: systemPrompt(input.kind) },
        { role: 'user', content: userPrompt(input) },
      ],
    }),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');

    throw new Error(`model request failed with ${response.status}. ${detail.slice(0, 200)}`);
  }

  const payload = await response.json();
  const content = payload?.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error('the model returned an empty response');
  }

  return input.kind === 'deck'
    ? normalizeDeck(JSON.parse(content), input)
    : normalizeDocument(JSON.parse(content), input);
}
