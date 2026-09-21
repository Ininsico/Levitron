import PptxGenJS from 'pptxgenjs';

const PAPER = 'FFFDF8';
const INK = '000000';
const BODY = '262626';
const MUTED = '6F6F6F';
const FONT = 'Arial';

export async function renderDeckPptx(document) {
  const pptx = new PptxGenJS();

  pptx.layout = 'LAYOUT_16x9';
  pptx.author = 'Levitron';
  pptx.company = 'Levitron';
  pptx.title = document.title;

  document.slides.forEach((slide, index) => {
    const sheet = pptx.addSlide();

    sheet.background = { color: PAPER };

    if (index === 0) {
      sheet.addText(slide.heading, {
        x: 0.7,
        y: 2.05,
        w: 8.6,
        h: 1.5,
        fontFace: FONT,
        fontSize: 40,
        bold: true,
        color: INK,
        valign: 'bottom',
      });

      const subtitle = slide.bullets[0] ?? '';
      if (subtitle) {
        sheet.addText(subtitle, {
          x: 0.7,
          y: 3.6,
          w: 8.6,
          h: 0.6,
          fontFace: FONT,
          fontSize: 16,
          color: MUTED,
        });
      }
    } else {
      sheet.addText(slide.heading, {
        x: 0.7,
        y: 0.45,
        w: 8.6,
        h: 0.9,
        fontFace: FONT,
        fontSize: 28,
        bold: true,
        color: INK,
        valign: 'middle',
      });

      sheet.addShape(pptx.ShapeType.line, {
        x: 0.7,
        y: 1.42,
        w: 8.6,
        h: 0,
        line: { color: 'D4D4D4', width: 1 },
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
            fontFace: FONT,
            fontSize: 16,
            color: BODY,
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
        fontFace: FONT,
        fontSize: 10,
        color: MUTED,
        align: 'right',
      });
    }

    if (slide.notes) {
      sheet.addNotes(slide.notes);
    }
  });

  return pptx.write({ outputType: 'nodebuffer' });
}
