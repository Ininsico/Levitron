import { Document as DocxDocument, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

import { resolveTheme } from '../themes.js';

export async function renderDocx(document) {
  const theme = resolveTheme(document.theme);

  const stamp = new Date().toISOString().slice(0, 10);
  const label = document.kind === 'deck' ? 'Presentation outline' : 'Document';

  const heading = (text, level) =>
    new Paragraph({
      text,
      heading: level,
      spacing: { before: 280, after: 120 },
    });

  const body = (text, extra = {}) =>
    new Paragraph({
      children: [new TextRun({ text, color: theme.body, font: theme.bodyFont, size: 22, ...extra })],
      spacing: { after: 200 },
    });

  const children = [
    new Paragraph({
      children: [new TextRun({ text: document.title, bold: true, color: theme.ink, font: theme.headFont, size: 44 })],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `Levitron · ${label} · ${stamp}`, color: theme.muted, font: theme.bodyFont, size: 18 }),
      ],
      spacing: { after: 320 },
    }),
  ];

  if (document.kind === 'deck') {
    document.slides.forEach((slide, index) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${index + 1}. ${slide.heading}`,
              bold: true,
              color: theme.ink,
              font: theme.headFont,
              size: 30,
            }),
          ],
          spacing: { before: 280, after: 120 },
        }),
      );

      slide.bullets.forEach((bullet) => {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: bullet, color: theme.body, font: theme.bodyFont, size: 22 })],
            bullet: { level: 0 },
            spacing: { after: 80 },
          }),
        );
      });

      if (slide.notes) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Speaker notes: ${slide.notes}`,
                italics: true,
                color: theme.muted,
                font: theme.bodyFont,
                size: 18,
              }),
            ],
            spacing: { before: 120, after: 160 },
          }),
        );
      }
    });
  } else {
    document.sections.forEach((section) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({ text: section.heading, bold: true, color: theme.ink, font: theme.headFont, size: 30 }),
          ],
          spacing: { before: 280, after: 120 },
        }),
      );

      section.paragraphs.forEach((paragraph) => {
        children.push(body(paragraph));
      });
    });
  }

  const docx = new DocxDocument({ sections: [{ children }] });

  return Packer.toBuffer(docx);
}
