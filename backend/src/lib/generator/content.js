const BULLET_PREFIX = /^[-*•·]\s+/;
const HEADING_PREFIX = /^#{1,6}\s+/;
const MAX_HEADING_LENGTH = 80;

function splitBlocks(raw) {
  return String(raw)
    .replace(/\r\n/g, '\n')
    .split(/\n\s*\n/)
    .map((block) =>
      block
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    )
    .filter((lines) => lines.length);
}

function cleanHeading(line) {
  return line
    .replace(HEADING_PREFIX, '')
    .replace(/[:.]+$/, '')
    .trim()
    .slice(0, 200);
}

/** A short, unpunctuated line on its own — "What changed", or a markdown heading. */
function isStandaloneHeading(line) {
  const trimmed = line.trim();

  if (!trimmed || trimmed.length > MAX_HEADING_LENGTH) return false;
  if (BULLET_PREFIX.test(trimmed)) return false;

  return HEADING_PREFIX.test(trimmed) || /:$/.test(trimmed) || !/[.!?]$/.test(trimmed);
}

/**
 * A heading written on its own line belongs to whatever follows it. Without
 * this, "What changed" would become an empty slide and its bullets would land
 * on the next one.
 */
function mergeHeadings(blocks) {
  const merged = [];

  for (let index = 0; index < blocks.length; index += 1) {
    const lines = blocks[index];
    const next = blocks[index + 1];

    if (lines.length === 1 && next && isStandaloneHeading(lines[0])) {
      merged.push([lines[0], ...next]);
      index += 1;
      continue;
    }

    merged.push(lines);
  }

  return merged;
}

function sentences(text) {
  return text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

function bulletsFrom(lines) {
  const bullets = [];

  for (const line of lines) {
    if (BULLET_PREFIX.test(line)) {
      bullets.push(line.replace(BULLET_PREFIX, '').trim().slice(0, 300));
      continue;
    }

    for (const sentence of sentences(line)) {
      bullets.push(sentence.slice(0, 300));
    }
  }

  return bullets;
}

/** Turns pasted content into slides, preserving the author's own structure. */
export function structureDeckFromContent(content, { maxSlides = 30 } = {}) {
  const slides = [];

  for (const lines of mergeHeadings(splitBlocks(content))) {
    let heading = '';
    let rest = lines;

    if (lines.length > 1 && isStandaloneHeading(lines[0])) {
      heading = cleanHeading(lines[0]);
      rest = lines.slice(1);
    }

    const bullets = bulletsFrom(rest);

    if (!heading) {
      const seed = bullets[0] ?? lines[0] ?? '';
      heading = cleanHeading(seed.split(/[,.;:]/)[0]) || `Slide ${slides.length + 1}`;
    }

    slides.push({
      heading,
      bullets: bullets.filter((bullet) => bullet && bullet !== heading).slice(0, 6),
      notes: '',
    });

    if (slides.length >= maxSlides) break;
  }

  return slides;
}

/** The same structure rules, applied to prose instead of bullets. */
export function structureDocumentFromContent(content) {
  return mergeHeadings(splitBlocks(content)).map((lines, index) => {
    let heading = '';
    let rest = lines;

    if (lines.length > 1 && isStandaloneHeading(lines[0])) {
      heading = cleanHeading(lines[0]);
      rest = lines.slice(1);
    }

    const paragraphs = [];
    let buffer = [];

    for (const line of rest) {
      if (BULLET_PREFIX.test(line)) {
        if (buffer.length) {
          paragraphs.push(buffer.join(' '));
          buffer = [];
        }

        paragraphs.push(line.replace(BULLET_PREFIX, '• ').trim());
        continue;
      }

      buffer.push(line);
    }

    if (buffer.length) paragraphs.push(buffer.join(' '));

    if (!heading) {
      const seed = paragraphs[0] ?? lines[0] ?? '';
      heading = cleanHeading(seed.split(/[,.;:]/)[0]) || `Section ${index + 1}`;
    }

    return {
      heading,
      paragraphs: paragraphs.filter((paragraph) => paragraph && paragraph !== heading).slice(0, 8),
    };
  });
}

export function contentTitle(content, fallback) {
  const firstLine = splitBlocks(content)[0]?.[0] ?? '';
  const derived = cleanHeading(firstLine) || fallback || 'Untitled';

  return derived.slice(0, 160);
}
