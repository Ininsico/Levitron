import { renderDocx } from './docx.js';
import { renderPdf } from './pdf.js';
import { renderDeckPptx } from './pptx.js';

// A deck exports to slides or a read-only PDF; a document exports to Word or
// PDF. Offering "deck as .docx" or "document as .pptx" would just produce a
// worse version of the same thing, so those combinations are not offered.
const FORMATS = {
  pptx: {
    label: 'PowerPoint',
    extension: 'pptx',
    contentType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    kinds: ['deck'],
    render: renderDeckPptx,
  },
  docx: {
    label: 'Word',
    extension: 'docx',
    contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    kinds: ['document'],
    render: renderDocx,
  },
  pdf: {
    label: 'PDF',
    extension: 'pdf',
    contentType: 'application/pdf',
    kinds: ['deck', 'document'],
    render: renderPdf,
  },
};

export function formatsFor(kind) {
  return Object.entries(FORMATS)
    .filter(([, format]) => format.kinds.includes(kind))
    .map(([name, format]) => ({ name, label: format.label, extension: format.extension }));
}

export function isSupported(format, kind) {
  return Boolean(FORMATS[format]?.kinds.includes(kind));
}

export function slugify(value) {
  const slug = String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);

  return slug || 'levitron-export';
}

export async function renderExport(document, format) {
  const entry = FORMATS[format];

  if (!entry || !entry.kinds.includes(document.kind)) {
    throw new Error(`${format} is not available for a ${document.kind}.`);
  }

  const buffer = await entry.render(document);

  return {
    buffer,
    contentType: entry.contentType,
    filename: `${slugify(document.title)}.${entry.extension}`,
    label: entry.label,
  };
}
