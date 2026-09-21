import { REPO_URL } from '../config.js'

export const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'Open source', href: '#open-source' },
  { label: 'FAQ', href: '#faq' },
]

export const features = [
  {
    icon: 'spark',
    title: 'Prompt to outline',
    body: 'Describe the talk in a sentence. Levitron drafts the narrative — sections, slide beats and speaker notes you can edit slide by slide.',
  },
  {
    icon: 'palette',
    title: 'Themeable by design',
    body: 'Every deck renders through one design system. Swap palettes, type scales and grids in a single stylesheet without touching layout.',
  },
  {
    icon: 'download',
    title: 'Print-perfect PDF',
    body: 'Embedded fonts, vector charts, CMYK-safe colours and bleed marks. What you preview is what the printer gets.',
  },
  {
    icon: 'chart',
    title: 'Live data slides',
    body: 'Charts are described as data, not screenshots. Point a slide at a JSON or CSV source and it re-renders on every build.',
  },
  {
    icon: 'server',
    title: 'Self-host anything',
    body: 'One Docker image, no vendor lock-in. Run it on a laptop, a VPS or air-gapped behind your own model gateway.',
  },
  {
    icon: 'terminal',
    title: 'API, CLI and CI',
    body: 'Generate decks from a build step: levitron build talk.yaml --out talk.pdf --theme lava. Ship docs that never go stale.',
  },
]

export const steps = [
  {
    step: '01',
    title: 'Describe it',
    body: 'Write a prompt, drop in a markdown file, or point Levitron at a repository. It reads the intent, not just the words.',
  },
  {
    step: '02',
    title: 'Shape it',
    body: 'Levitron proposes an outline and a visual direction. Rearrange slides, tighten copy, or override the theme with your own tokens.',
  },
  {
    step: '03',
    title: 'Ship it',
    body: 'Export a pixel-accurate PDF, present straight from the browser, or hand the PPTX to whoever insists on editing it themselves.',
  },
]

export const faqs = [
  {
    q: 'Is Levitron really free and open source?',
    a: 'Yes. The core generator, the design system and every exporter are MIT licensed. You can fork it, rebrand it and run it commercially without paying anyone. Hosted convenience is optional, never required.',
  },
  {
    q: 'Which models can it use?',
    a: 'Levitron talks to any OpenAI-compatible endpoint, so you can bring Anthropic, OpenAI, Mistral, a local Ollama model or your own gateway. Point it at a base URL and a key and it works.',
  },
  {
    q: 'Can I export to PowerPoint instead of PDF?',
    a: 'Both. PDF is the default because it renders identically everywhere. PPTX export keeps text and charts editable so a colleague can still tweak slide 9 five minutes before the meeting.',
  },
  {
    q: 'Where does my content go?',
    a: 'Wherever you tell it to. Self-hosted Levitron keeps prompts, documents and decks inside your own network — nothing leaves unless you configure an external model provider.',
  },
  {
    q: 'How do I contribute?',
    a: 'Themes are the easiest entry point, and the most valuable. Pick up an issue labelled good-first-theme, add a stylesheet, and the gallery picks it up automatically. Docs, exporters and bug reports are equally welcome.',
  },
]

export const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Open source', href: '#open-source' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', href: '#open-source' },
      { label: 'REST API', href: '#open-source' },
      { label: 'CLI reference', href: '#open-source' },
      { label: 'Self-hosting', href: '#open-source' },
    ],
  },
  {
    title: 'Community',
    links: [
      { label: 'GitHub', href: REPO_URL },
      { label: 'Issues', href: `${REPO_URL}/issues` },
      { label: 'Pull requests', href: `${REPO_URL}/pulls` },
      { label: 'Releases', href: `${REPO_URL}/releases` },
    ],
  },
]

export const fallbackStats = {
  decksGenerated: 128400,
  slidesGenerated: 1932000,
  contributors: 84,
  averageRenderMs: 2400,
  license: 'MIT',
}
