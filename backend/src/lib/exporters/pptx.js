import PptxGenJS from 'pptxgenjs';

import { resolveTheme } from '../themes.js';

export async function renderDeckPptx(document) {
  const theme = resolveTheme(document.theme);

  const pptx = new PptxGenJS();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Levitron';
  pptx.company = 'Levitron';
  pptx.title = document.title;

  document.slides.forEach((slide, index) => {
    const sheet = pptx.addSlide();

    sheet.background = { color: theme.background };

    if (index === 0) {
      // Title slide: accent bar, title, subtitle, rule.
      sheet.addShape(pptx.ShapeType.rect, {
        x: 0.7,
        y: 1.75,
        w: 1.6,
        h: 0.11,
        fill: { color: theme.accent },
      });

      sheet.addText(slide.heading, {
        x: 0.7,
        y: 2.05,
        w: 8.6,
        h: 1.4,
        fontFace: theme.headFont,
        fontSize: 40,
        bold: true,
        color: theme.ink,
        valign: 'bottom',
      });

      const subtitle = slide.bullets[0] ?? '';
      if (subtitle) {
        sheet.addText(subtitle, {
          x: 0.7,
          y: 3.55,
          w: 8.6,
          h: 0.6,
          fontFace: theme.bodyFont,
          fontSize: 16,
          color: theme.muted,
        });
      }
    } else {
      sheet.addText(slide.heading, {
        x: 0.7,
        y: 0.45,
        w: 8.6,
        h: 0.85,
        fontFace: theme.headFont,
        fontSize: 28,
        bold: true,
        color: theme.ink,
        valign: 'middle',
      });

      sheet.addShape(pptx.ShapeType.rect, {
        x: 0.7,
        y: 1.38,
        w: 0.9,
        h: 0.07,
        fill: { color: theme.accent },
      });

      if (slide.bullets.length) {
        sheet.addText(
          slide.bullets.map((bullet) => ({
            text: bullet,
            options: { bullet: { indent: 18 }, breakLine: true },
          })),
          {
            x: 0.85,
            y: 1.75,
            w: 8.3,
            h: 3.3,
            fontFace: theme.bodyFont,
            fontSize: 16,
            color: theme.body,
            lineSpacingMultiple: 1.4,
            valign: 'top',
          },
        );
      }

      sheet.addText(String(index + 1), {
        x: 8.6,
        y: 5.05,
        w: 0.9,
        h: 0.3,
        fontFace: theme.bodyFont,
        fontSize: 10,
        color: theme.muted,
        align: 'right',
      });
    }

    if (slide.notes) {
      sheet.addNotes(slide.notes);
    }
  });

  return pptx.write({ outputType: 'nodebuffer' });
}
