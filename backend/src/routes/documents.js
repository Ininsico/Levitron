import { Router } from 'express';
import mongoose from 'mongoose';

import { formatsFor, isSupported, renderExport } from '../lib/exporters/index.js';
import { generateOutline, generatorStatus } from '../lib/generator/index.js';
import { SLIDE_ICONS, normalizeIcon } from '../lib/icons.js';
import { DEFAULT_THEME_ID, isKnownTheme, listThemes } from '../lib/themes.js';
import { Document } from '../models/Document.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireDatabase } from '../middleware/requireDatabase.js';

const MIN_TOPIC_LENGTH = 8;
const MAX_TOPIC_LENGTH = 2000;
const MAX_CONTENT_LENGTH = 20000;
const MIN_SLIDES = 4;
const MAX_SLIDES = 30;

export const documentsRouter = Router();

documentsRouter.use(requireDatabase, requireAuth);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function summary(document) {
  return {
    id: document._id.toString(),
    title: document.title,
    kind: document.kind,
    theme: document.theme,
    source: document.source,
    slideCount: document.slides.length,
    sectionCount: document.sections.length,
    lastExportFormat: document.lastExportFormat,
    createdAt: document.createdAt,
    updatedAt: document.updatedAt,
  };
}

/** Everything the dashboard needs to render itself correctly. */
documentsRouter.get('/capabilities', (req, res) => {
  res.json({
    data: {
      generator: generatorStatus(),
      themes: listThemes(),
      icons: SLIDE_ICONS,
      defaultTheme: DEFAULT_THEME_ID,
      limits: { maxContentLength: MAX_CONTENT_LENGTH, maxSlides: MAX_SLIDES, maxTopicLength: MAX_TOPIC_LENGTH },
      formats: {
        deck: formatsFor('deck'),
        document: formatsFor('document'),
      },
    },
  });
});

documentsRouter.get('/', async (req, res) => {
  const documents = await Document.find({ owner: req.user._id }).sort({ updatedAt: -1 }).limit(60);

  res.json({ data: documents.map(summary) });
});

documentsRouter.post('/', async (req, res) => {
  const rawTopic = typeof req.body?.topic === 'string' ? req.body.topic : '';
  const rawContent = typeof req.body?.input === 'string' ? req.body.input : '';

  if (rawTopic.length > MAX_TOPIC_LENGTH) {
    return res.status(400).json({ error: `Keep the brief under ${MAX_TOPIC_LENGTH} characters.` });
  }

  // Rejected rather than truncated — silently losing someone's pasted content
  // would be worse than refusing it.
  if (rawContent.length > MAX_CONTENT_LENGTH) {
    return res.status(400).json({ error: `Content is limited to ${MAX_CONTENT_LENGTH} characters.` });
  }

  const topic = rawTopic.trim();
  const input = rawContent.trim();
  const kind = req.body?.kind === 'document' ? 'document' : 'deck';
  const theme = isKnownTheme(req.body?.theme) ? req.body.theme : DEFAULT_THEME_ID;
  const audience = typeof req.body?.audience === 'string' ? req.body.audience.trim().slice(0, 200) : '';
  const tone = typeof req.body?.tone === 'string' ? req.body.tone.trim().slice(0, 80) : '';
  const slideCount = clamp(Number(req.body?.slideCount) || 10, MIN_SLIDES, MAX_SLIDES);

  if (!topic && !input) {
    return res.status(400).json({ error: 'Describe what you want, or paste the content to work from.' });
  }

  if (!input && topic.length < MIN_TOPIC_LENGTH) {
    return res
      .status(400)
      .json({ error: `Give it a little more to work with — at least ${MIN_TOPIC_LENGTH} characters.` });
  }

  const outline = await generateOutline({ topic, content: input, kind, audience, tone, slideCount });

  const created = await Document.create({
    owner: req.user._id,
    title: outline.title,
    kind,
    topic,
    input,
    audience,
    tone,
    theme,
    source: outline.source,
    model: outline.model,
    slides: outline.slides,
    sections: outline.sections,
  });

  res.status(201).json({ data: created.toPublicJSON() });
});

documentsRouter.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'That document does not exist.' });
  }

  const document = await Document.findOne({ _id: req.params.id, owner: req.user._id });

  if (!document) {
    return res.status(404).json({ error: 'That document does not exist.' });
  }

  res.json({ data: document.toPublicJSON() });
});

documentsRouter.patch('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'That document does not exist.' });
  }

  const document = await Document.findOne({ _id: req.params.id, owner: req.user._id });

  if (!document) {
    return res.status(404).json({ error: 'That document does not exist.' });
  }

  if (typeof req.body?.title === 'string') {
    const title = req.body.title.trim().slice(0, 160);

    if (!title) {
      return res.status(400).json({ error: 'A title is required.' });
    }

    document.title = title;
  }

  if (typeof req.body?.theme === 'string' && isKnownTheme(req.body.theme)) {
    document.theme = req.body.theme;
  }

  if (Array.isArray(req.body?.slides) && document.kind === 'deck') {
    document.slides = req.body.slides
      .map((slide) => ({
        heading: typeof slide?.heading === 'string' ? slide.heading.trim().slice(0, 200) : '',
        bullets: (Array.isArray(slide?.bullets) ? slide.bullets : [])
          .map((bullet) => (typeof bullet === 'string' ? bullet.trim().slice(0, 300) : ''))
          .filter(Boolean)
          .slice(0, 8),
        notes: typeof slide?.notes === 'string' ? slide.notes.trim().slice(0, 2000) : '',
        icon: normalizeIcon(slide?.icon),
      }))
      .filter((slide) => slide.heading);
  }

  if (Array.isArray(req.body?.sections) && document.kind === 'document') {
    document.sections = req.body.sections
      .map((section) => ({
        heading: typeof section?.heading === 'string' ? section.heading.trim().slice(0, 200) : '',
        paragraphs: (Array.isArray(section?.paragraphs) ? section.paragraphs : [])
          .map((paragraph) => (typeof paragraph === 'string' ? paragraph.trim().slice(0, 2000) : ''))
          .filter(Boolean)
          .slice(0, 6),
      }))
      .filter((section) => section.heading);
  }

  await document.save();

  res.json({ data: document.toPublicJSON() });
});

documentsRouter.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'That document does not exist.' });
  }

  const removed = await Document.findOneAndDelete({ _id: req.params.id, owner: req.user._id });

  if (!removed) {
    return res.status(404).json({ error: 'That document does not exist.' });
  }

  res.json({ data: { id: req.params.id, deleted: true } });
});

documentsRouter.post('/:id/export', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ error: 'That document does not exist.' });
  }

  const document = await Document.findOne({ _id: req.params.id, owner: req.user._id });

  if (!document) {
    return res.status(404).json({ error: 'That document does not exist.' });
  }

  const format = String(req.body?.format ?? '').toLowerCase();

  if (!isSupported(format, document.kind)) {
    const allowed = formatsFor(document.kind)
      .map((entry) => entry.name)
      .join(', ');

    return res.status(400).json({ error: `Choose one of: ${allowed}.` });
  }

  const file = await renderExport(document, format);

  document.lastExportedAt = new Date();
  document.lastExportFormat = format;
  await document.save();

  res.setHeader('Content-Type', file.contentType);
  res.setHeader('Content-Length', file.buffer.length);
  res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);

  res.send(file.buffer);
});
