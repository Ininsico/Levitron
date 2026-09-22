import PptxGenJS from 'pptxgenjs';

import { iconDataUri, iconSvg, isKnownIcon } from '../icons.js';
import { resolveTheme } from '../themes.js';

export async function renderDeckPptx(document) {
  const theme = resolveTheme(document.theme);

  const pptx = new PptxGenJS();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Levitron';
  pptx.company = 'Levitron';
  pptx.title = document.title;

  for (const [index, slide] of document.slides.entries()) {
    const sheet = pptx.addSlide();

    sheet.background = { color: theme.background };

    if (index === 0) {
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
        w: 7.4,
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

      const layout = index === 0 ? 'title' : (slide.layout ?? 'bullets');

      // Background wash, approximating the preview's radial gradient.
      sheet.addShape(pptx.ShapeType.rect, {
        x: 0,
        y: 0,
        w: 5.6,
        h: 5.63,
        fill: { color: theme.surface, transparency: 55 },
        line: { color: theme.background, width: 0 },
      });

      if (layout === 'statement' && (slide.statement || slide.heading)) {
        sheet.addText(slide.statement || slide.heading, {
          x: 0.9,
          y: 1.7,
          w: 8.2,
          h: 2.2,
          fontFace: theme.headFont,
          fontSize: 30,
          bold: true,
          color: theme.ink,
          valign: 'middle',
        });
      } else if (layout === 'metrics' && (slide.metrics ?? []).length) {
        const metrics = slide.metrics.slice(0, 4);

        metrics.forEach((metric, position) => {
          const width = 8.6 / metrics.length;
          const x = 0.7 + position * width;

          sheet.addText(metric.value, {
            x,
            y: 1.7,
            w: width - 0.2,
            h: 0.9,
            fontFace: theme.headFont,
            fontSize: 32,
            bold: true,
            color: theme.accent,
          });

          sheet.addText(metric.label, {
            x,
            y: 2.6,
            w: width - 0.2,
            h: 0.9,
            fontFace: theme.bodyFont,
            fontSize: 11,
            color: theme.muted,
          });
        });
      } else if (layout === 'comparison' && slide.comparison?.left?.length) {
        const { comparison } = slide;

        [
          { title: comparison.leftTitle, items: comparison.left ?? [], x: 0.7, color: theme.muted },
          { title: comparison.rightTitle, items: comparison.right ?? [], x: 5.2, color: theme.accent },
        ].forEach((column) => {
          sheet.addText(column.title ?? '', {
            x: column.x,
            y: 1.4,
            w: 4.2,
            h: 0.4,
            fontFace: theme.bodyFont,
            fontSize: 11,
            bold: true,
            color: column.color,
          });

          sheet.addText(
            column.items.map((item) => ({ text: item, options: { bullet: { indent: 14 }, breakLine: true } })),
            {
              x: column.x,
              y: 1.9,
              w: 4.2,
              h: 2.6,
              fontFace: theme.bodyFont,
              fontSize: 13,
              color: theme.body,
              lineSpacingMultiple: 1.3,
              valign: 'top',
            },
          );
        });
      } else if (slide.bullets.length) {
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

    // The slide's icon, embedded as SVG. PowerPoint has supported SVG since
    // 2016; studios generate a fallback PNG automatically.
    if (slide.icon && isKnownIcon(slide.icon)) {
      try {
        const svg = await iconSvg(slide.icon, theme.accent);

        sheet.addImage({
          data: iconDataUri(svg),
          x: index === 0 ? 8.35 : 8.35,
          y: 0.4,
          w: 0.7,
          h: 0.7,
        });
      } catch (error) {
        // A missing icon must never fail an export.
        console.warn(`[pptx] could not embed icon "${slide.icon}": ${error.message}`);
      }
    }

    if (slide.notes) {
      sheet.addNotes(slide.notes);
    }
  }

  return pptx.write({ outputType: 'nodebuffer' });
}
