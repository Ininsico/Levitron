import mongoose from 'mongoose';

import { DEFAULT_THEME_ID } from '../lib/themes.js';

const slideSchema = new mongoose.Schema(
  {
    heading: { type: String, required: true, trim: true, maxlength: 200 },
    bullets: { type: [String], default: [] },
    notes: { type: String, default: '', maxlength: 2000 },
    icon: { type: String, default: '', trim: true, maxlength: 40 },
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

    // How the outline was produced, surfaced in the UI so nobody is misled
    // about whether an AI model actually wrote it.
    source: { type: String, enum: ['ai', 'draft'], default: 'draft' },
    model: { type: String, default: '' },

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
    source: this.source,
    model: this.model,
    slides: this.slides,
    sections: this.sections,
    lastExportedAt: this.lastExportedAt,
    lastExportFormat: this.lastExportFormat,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const Document = mongoose.model('Document', documentSchema);
