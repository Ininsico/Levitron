import { SLIDE_ICONS, normalizeIcon } from '../icons.js';

const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_MODEL = 'gpt-4o-mini';
const REQUEST_TIMEOUT_MS = 90000;

export function isAiConfigured() {
  return Boolean(process.env.AI_API_KEY);
}

export function aiModelName() {
  return process.env.AI_MODEL || DEFAULT_MODEL;
}

function systemPrompt(kind) {
  if (kind === 'deck') {
    return [
      'You are a presentation designer. You write decks that senior people actually pay attention to — not slide-shaped summaries of a topic.',
      '',
      'Reply with JSON only, matching exactly this shape:',
      '{"title": string, "slides": [{"heading": string, "layout": string, "bullets": string[], "statement": string, "metrics": [{"value": string, "label": string}], "comparison": {"leftTitle": string, "left": string[], "rightTitle": string, "right": string[]}, "notes": string, "icon": string}]}',
      '',
      'Slide 1 is the title slide: the heading is the deck title, and it may carry at most two lines of framing as bullets.',
      '',
      'Choose a layout per slide. Using only "bullets" is what makes a deck look like a list, so vary them:',
      '- "bullets" — the default. 3 to 5 bullets.',
      '- "statement" — one sentence that carries the whole slide. Put it in "statement", leave "bullets" empty. Use it for the single most important claim.',
      '- "metrics" — 2 to 4 figures in "metrics", each {"value", "label"}. Values are short strings ("99.98%", "6 min", "2.4x"). Use for results.',
      '- "comparison" — two columns in "comparison": leftTitle/left and rightTitle/right, 2 to 4 short items each. Use for before/after, build/buy, today/tomorrow.',
      '- At least two slides must not be "bullets", and never repeat the same layout on consecutive slides.',
      '',
      'Every other slide must:',
      '- Advance an argument. Someone reading only the headings should be able to follow the whole deck.',
      '- Carry 3 to 5 bullets, each under 14 words, each a specific claim, number, name or decision.',
      '- Be free of filler. "Improved efficiency", "enhanced resilience", "better collaboration", "streamlined processes", "key insights" and anything like them are banned. Say the concrete thing instead.',
      '- Never restate its own heading in a bullet, and never duplicate another slide.',
      '- Vary in kind: statements, comparisons, metrics, trade-offs, risks and decisions — not eight identical bullet lists.',
      '',
      '"notes" is 2 to 4 sentences of what the presenter says out loud: the context, the specific detail behind the slide, and the point being made. It must never simply restate the bullets.',
      '',
      `"icon" must be exactly one name from this list, chosen to fit the slide's subject. Never invent a name:\n${SLIDE_ICONS.join(', ')}`,
      '',
      'Hard rules:',
      '- Never invent statistics, dates, prices, names, quotes or sources. If a number would help but was not supplied, describe it qualitatively ("roughly halved", "low single digits").',
      '- Never contradict or drift from the brief or from any material the author supplied.',
      '- Plain English. No marketing language, no buzzwords, no exclamation marks.',
    ].join('\n');
  }

  return [
    'You write internal business documents that a busy executive can act on.',
    '',
    'Reply with JSON only, matching exactly this shape:',
    '{"title": string, "sections": [{"heading": string, "paragraphs": string[]}]}',
    '',
    'Rules:',
    '- 6 to 8 sections. Each has 2 to 3 paragraphs of one to three sentences.',
    '- Every paragraph must carry information: a specific detail, a number, a named trade-off, a named owner, a date. No paragraph may be pure throat-clearing.',
    '- No filler phrases: "in today\'s fast-paced environment", "it is important to note", "streamline processes", "leverage synergies" and anything like them are banned.',
    '- Never restate the section heading as the opening sentence of a paragraph.',
    '- Never invent statistics, dates, prices, names, quotes or sources. Describe unknowns qualitatively instead.',
    '- End with a section that states a clear recommendation or next step.',
    '- Plain, direct English.',
  ].join('\n');
}

function userPrompt({ topic, kind, audience, tone, slideCount, content }) {
  const lines = [
    kind === 'deck'
      ? `Write a presentation outline${topic ? ' for:' : '.'}`
      : `Write a document${topic ? ' about:' : '.'}`,
  ];

  if (topic) lines.push(topic);

  lines.push('');

  if (kind === 'deck') {
    lines.push(`Slide count: ${slideCount} (including the title slide)`);
  } else {
    lines.push('Length: concise — roughly two pages');
  }

  if (audience) lines.push(`Audience: ${audience}`);
  if (tone) lines.push(`Tone: ${tone}`);

  if (content && String(content).trim()) {
    lines.push(
      '',
      'The author supplied the following material. Build the outline from it.',
      'Every fact, figure, name and claim in their material must survive intact — never invent numbers, dates or quotes, and never contradict them.',
      'You may add framing and implications to make each slide worth presenting, but the substance has to be theirs.',
      '---',
      String(content).trim().slice(0, 20000),
      '---',
    );
  }

  return lines.join('\n');
}

function cleanText(value, max) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

const LAYOUTS = ['title', 'bullets', 'statement', 'metrics', 'comparison'];

function normalizeDeck(parsed, { topic, slideCount }) {
  const slides = Array.isArray(parsed?.slides) ? parsed.slides : [];

  const cleaned = slides
    .map((slide, index) => {
      const requested = String(slide?.layout ?? '').toLowerCase();
      const layout = index === 0 ? 'title' : LAYOUTS.includes(requested) ? requested : 'bullets';

      const metrics = (Array.isArray(slide?.metrics) ? slide.metrics : [])
        .map((metric) => ({
          value: cleanText(metric?.value, 40),
          label: cleanText(metric?.label, 120),
        }))
        .filter((metric) => metric.value)
        .slice(0, 4);

      const comparison = {
        leftTitle: cleanText(slide?.comparison?.leftTitle, 120),
        left: (Array.isArray(slide?.comparison?.left) ? slide.comparison.left : [])
          .map((item) => cleanText(item, 300))
          .filter(Boolean)
          .slice(0, 4),
        rightTitle: cleanText(slide?.comparison?.rightTitle, 120),
        right: (Array.isArray(slide?.comparison?.right) ? slide.comparison.right : [])
          .map((item) => cleanText(item, 300))
          .filter(Boolean)
          .slice(0, 4),
      };

      return {
        heading: cleanText(slide?.heading, 200),
        bullets: (Array.isArray(slide?.bullets) ? slide.bullets : [])
          .map((bullet) => cleanText(bullet, 300))
          .filter(Boolean)
          .slice(0, 6),
        notes: cleanText(slide?.notes, 2000),
        icon: normalizeIcon(slide?.icon),
        layout,
        statement: cleanText(slide?.statement, 400),
        metrics: layout === 'metrics' ? metrics : [],
        comparison: layout === 'comparison' ? comparison : { leftTitle: '', left: [], rightTitle: '', right: [] },
      };
    })
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
      temperature: 0.7,
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
