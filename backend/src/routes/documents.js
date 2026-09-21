import { Router } from 'express';
import mongoose from 'mongoose';

import { formatsFor, isSupported, renderExport } from '../lib/exporters/index.js';
import { generateOutline, generatorStatus } from '../lib/generator/index.js';
import { Document } from '../models/Document.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { requireDatabase } from '../middleware/requireDatabase.js';

const MIN_TOPIC_LENGTH = 8;
const MAX_TOPIC_LENGTH = 2000;
const MIN_SLIDES = 4;
const MAX_SLIDES = 30;

export const documentsRouter = Router();

documentsRouter.use(requireDatabase, requireAuth);

function cleanText(value, max) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function summary(document) {
  return {
    id: document._id.toString(),
    title: document.title,
    kind: document.kind,
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
  const topic = cleanText(req.body?.topic, MAX_TOPIC_LENGTH);
  const kind = req.body?.kind === 'document' ? 'document' : 'deck';
  const audience = cleanText(req.body?.audience, 200);
  const tone = cleanText(req.body?.tone, 80);
  const slideCount = clamp(Number(req.body?.slideCount) || 10, MIN_SLIDES, MAX_SLIDES);

  if (!topic) {
    return res.status(400).json({ error: 'Describe what you want to create.' });
  }

  if (topic.length < MIN_TOPIC_LENGTH) {
    return res
      .status(400)
      .json({ error: `Give it a little more to work with — at least ${MIN_TOPIC_LENGTH} characters.` });
  }

  const outline = await generateOutline({ topic, kind, audience, tone, slideCount });

  const created = await Document.create({
    owner: req.user._id,
    title: outline.title,
    kind,
    topic,
    audience,
    tone,
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
    const title = cleanText(req.body.title, 160);

    if (!title) {
      return res.status(400).json({ error: 'A title is required.' });
    }

    document.title = title;
  }

  if (Array.isArray(req.body?.slides) && document.kind === 'deck') {
    document.slides = req.body.slides
      .map((slide) => ({
        heading: cleanText(slide?.heading, 200),
        bullets: (Array.isArray(slide?.bullets) ? slide.bullets : [])
          .map((bullet) => cleanText(bullet, 300))
          .filter(Boolean)
          .slice(0, 8),
        notes: cleanText(slide?.notes, 2000),
      }))
      .filter((slide) => slide.heading);
  }

  if (Array.isArray(req.body?.sections) && document.kind === 'document') {
    document.sections = req.body.sections
      .map((section) => ({
        heading: cleanText(section?.heading, 200),
        paragraphs: (Array.isArray(section?.paragraphs) ? section.paragraphs : [])
          .map((paragraph) => cleanText(paragraph, 2000))
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
