import mongoose from 'mongoose';

import { DEFAULT_THEME_ID } from '../lib/themes.js';

const slideSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true, maxlength: 200 },
    bullets: { type: [String], default: [] },
    notes: { type: String, default: '', maxlength: 2000 },
    icon: { type: String, default: '', trim: true, maxlength: 40 },

    // Layout is what stops a deck being eight identical bullet lists.
    layout: {
      type: String,
      enum: ['title', 'bullets', 'statement', 'metrics', 'comparison'],
      default: 'bullets',
    },

    // One big sentence for a `statement` slide.
    statement: { type: String, default: '', maxlength: 400 },

    // Big numbers for a `metrics` slide.
    metrics: {
      type: [
        new mongoose.Schema(
          {
            value: { type: String, default: '', maxlength: 40 },
            label: { type: String, default: '', maxlength: 120 },
          },
          { _id: false },
        ),
      ],
      default: [],
    },

    // Two opposing columns for a `comparison` slide.
    comparison: {
      type: new mongoose.Schema(
        {
          leftTitle: { type: String, default: '', maxlength: 120 },
          left: { type: [String], default: [] },
          rightTitle: { type: String, default: '', maxlength: 120 },
          right: { type: [String], default: [] },
        },
        { _id: false },
      ),
      default: () => ({}),
    },
  },
  { _id: false },
);

const sectionSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true, maxlength: 200 },
    paragraphs: { type: [String], default: [] },
  },
  { _id: false },
);

const documentSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 160 },
    kind: { type: String, enum: ['deck', 'document'], required: true },

    // A brief is optional when the author pasted their own material instead.
    topic: { type: String, default: '', trim: true, maxlength: 2000 },
    input: { type: String, default: '', maxlength: 20000 },

    audience: { type: String, default: '', trim: true, maxlength: 200 },
    tone: { type: String, default: '', trim: true, maxlength: 80 },
    theme: { type: String, default: DEFAULT_THEME_ID, trim: true },

    // Three colours are enough to derive a complete theme; themes.js fills in
    // surface, body, muted and accentInk so nothing can end up undefined.
    customTheme: {
      type: new mongoose.Schema(
        {
          background: { type: String, default: '', trim: true, maxlength: 6 },
          ink: { type: String, default: '', trim: true, maxlength: 6 },
          accent: { type: String, default: '', trim: true, maxlength: 6 },
        },
        { _id: false },
      ),
      default: () => ({}),
    },

    // How the outline was produced, surfaced in the UI so nobody is misled
    // about whether an AI model actually wrote it.
    source: { type: String, enum: ['ai', 'draft'], default: 'draft' },
    model: { type: String, default: '' },
    fallbackReason: { type: String, default: '', maxlength: 500 },

    slides: { type: [slideSchema], default: [] },
    sections: { type: [sectionSchema], default: [] },

    lastExportedAt: Date,
    lastExportFormat: String,
  },
  { timestamps: true, versionKey: false },
);

documentSchema.index({ owner: 1, updatedAt: -1 });

documentSchema.methods.toPublicJSON = function toPublicJSON() {
  return {
    id: this._id.toString(),
    title: this.title,
    kind: this.kind,
    topic: this.topic,
    hasInput: Boolean(this.input),
    audience: this.audience,
    tone: this.tone,
    theme: this.theme,
    customTheme: this.customTheme,
    source: this.source,
    model: this.model,
    fallbackReason: this.fallbackReason,
    slides: this.slides,
    sections: this.sections,
    lastExportedAt: this.lastExportedAt,
    lastExportFormat: this.lastExportFormat,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Document = mongoose.model('Document', documentSchema);
