/**
 * Presentation themes. One source of truth, used by the in-app preview and by
 * all three exporters, so an exported file matches what you looked at.
 *
 * Colours are six-digit hex without the leading '#', which is what pptxgenjs
 * wants; the PDF exporter adds its own '#'.
 *
 * `pdfFamily` maps the theme's look onto the standard PDF base fonts, because
 * pdfkit can only embed Helvetica / Times / Courier without shipping a font
 * file. PPTX and DOCX use the real font names and resolve them on the viewer's
 * machine.
 */
export const THEMES = [
  {
    id: 'mono',
    name: 'Mono',
    description: 'Cream paper, black ink. The Levitron default.',
    background: 'FFFDF8',
    surface: 'F4ECDC',
    ink: '000000',
    body: '262626',
    muted: '909090',
    accent: '000000',
    accentInk: 'FFFDF8',
    headFont: 'Arial',
    bodyFont: 'Arial',
    pdfFamily: 'sans',
  },
  {
    id: 'ink',
    name: 'Ink',
    description: 'White paper with serif headlines. Editorial and calm.',
    background: 'FFFFFF',
    surface: 'F2F2F2',
    ink: '111111',
    body: '333333',
    muted: '888888',
    accent: '111111',
    accentInk: 'FFFFFF',
    headFont: 'Georgia',
    bodyFont: 'Georgia',
    pdfFamily: 'serif',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Near-black with cool white type.',
    background: '0B0B0C',
    surface: '1A1A1D',
    ink: 'FFFFFF',
    body: 'D8D8DC',
    muted: '7E7E86',
    accent: 'FFFFFF',
    accentInk: '0B0B0C',
    headFont: 'Arial',
    bodyFont: 'Arial',
    pdfFamily: 'sans',
  },
  {
    id: 'graphite',
    name: 'Graphite',
    description: 'Dark grey, low contrast, deliberately understated.',
    background: '1C1C1E',
    surface: '2A2A2E',
    ink: 'F5F5F7',
    body: 'C7C7CC',
    muted: '7C7C82',
    accent: 'C7C7CC',
    accentInk: '1C1C1E',
    headFont: 'Verdana',
    bodyFont: 'Verdana',
    pdfFamily: 'sans',
  },
  {
    id: 'ember',
    name: 'Ember',
    description: 'Charcoal with a warm orange accent.',
    background: '14100E',
    surface: '241C18',
    ink: 'FFF6EF',
    body: 'E0CFC2',
    muted: '93806F',
    accent: 'FF6B2C',
    accentInk: '14100E',
    headFont: 'Trebuchet MS',
    bodyFont: 'Trebuchet MS',
    pdfFamily: 'sans',
  },
  {
    id: 'forest',
    name: 'Forest',
    description: 'Deep green with a mint accent.',
    background: '0E1A14',
    surface: '17271E',
    ink: 'ECF7F0',
    body: 'C2D8CA',
    muted: '7C9887',
    accent: '5FD69B',
    accentInk: '0E1A14',
    headFont: 'Arial',
    bodyFont: 'Arial',
    pdfFamily: 'sans',
  },
  {
    id: 'plum',
    name: 'Plum',
    description: 'Dark violet with a soft lavender accent.',
    background: '150F1C',
    surface: '231A2E',
    ink: 'F6F0FB',
    body: 'D3C4E0',
    muted: '8E7C9E',
    accent: 'B98CE8',
    accentInk: '150F1C',
    headFont: 'Georgia',
    bodyFont: 'Georgia',
    pdfFamily: 'serif',
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Deep teal with a bright cyan accent.',
    background: '08171C',
    surface: '0F242B',
    ink: 'EAF7FA',
    body: 'BED8DF',
    muted: '7796A0',
    accent: '3FC8E4',
    accentInk: '08171C',
    headFont: 'Arial',
    bodyFont: 'Arial',
    pdfFamily: 'sans',
  },
  {
    id: 'sand',
    name: 'Sand',
    description: 'Warm sand paper with a terracotta accent.',
    background: 'F5EFE3',
    surface: 'EAE0CD',
    ink: '2B2118',
    body: '4A3B2C',
    muted: '8C7A64',
    accent: 'B4552D',
    accentInk: 'F5EFE3',
    headFont: 'Georgia',
    bodyFont: 'Arial',
    pdfFamily: 'serif',
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    description: 'Deep navy with a technical cyan accent.',
    background: '0A2540',
    surface: '10314F',
    ink: 'F0F6FF',
    body: 'C3D6EC',
    muted: '7791AC',
    accent: '48B0F7',
    accentInk: '0A2540',
    headFont: 'Arial',
    bodyFont: 'Arial',
    pdfFamily: 'sans',
  },
];

export const DEFAULT_THEME_ID = 'mono';

/**
 * The complete theme objects, deliberately. An earlier version returned only a
 * few fields and the preview then rendered `#undefined` for body and muted —
 * an invalid colour the browser drops, so the text inherited the app's dark
 * ink and vanished against every dark theme.
 */
export function listThemes() {
  return THEMES;
}

export function resolveTheme(id) {
  return THEMES.find((theme) => theme.id === id) ?? THEMES.find((theme) => theme.id === DEFAULT_THEME_ID);
}

export function isKnownTheme(id) {
  return THEMES.some((theme) => theme.id === id);
}
