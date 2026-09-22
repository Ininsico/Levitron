import PDFDocument from 'pdfkit';

import { resolveTheme } from '../themes.js';

// pdfkit can only use the standard base fonts unless a font file is embedded,
// so each theme maps onto Helvetica or Times.
const BASE_FONTS = {
  sans: { bold: 'Helvetica-Bold', regular: 'Helvetica', italic: 'Helvetica-Oblique' },
  serif: { bold: 'Times-Bold', regular: 'Times-Roman', italic: 'Times-Italic' },
};

function hex(value) {
  return `#${value}`;
}

export function renderPdf(document) {
  const theme = resolveTheme(document.theme, document.customTheme);
  const fonts = BASE_FONTS[theme.pdfFamily] ?? BASE_FONTS.sans;

  return new Promise((resolve, reject) => {
    const pdf = new PDFDocument({
      size: 'A4',
      margin: 56,
      info: { Title: document.title, Author: 'Levitron', Creator: 'Levitron' },
    });

    const chunks = [];

    pdf.on('data', (chunk) => chunks.push(chunk));
    pdf.on('end', () => resolve(Buffer.concat(chunks)));
    pdf.on('error', reject);

    // Dark themes need a full-bleed background on every page, including the
    // ones pdfkit adds itself when content overflows.
    const paintBackground = () => {
      pdf.save();
      pdf.rect(0, 0, pdf.page.width, pdf.page.height).fill(hex(theme.background));
      pdf.restore();
    };

    const stamp = new Date().toISOString().slice(0, 10);
    const label = document.kind === 'deck' ? 'Presentation outline' : 'Document';

    if (theme.background !== 'FFFFFF') {
      pdf.on('pageAdded', paintBackground);
    }

    paintBackground();

    pdf.font(fonts.bold).fontSize(26).fillColor(hex(theme.ink)).text(document.title);
    pdf.moveDown(0.3);

    pdf
      .rect(pdf.x, pdf.y, 64, 4)
      .fill(hex(theme.accent));

    pdf.moveDown(0.6);
    pdf
      .font(fonts.regular)
      .fontSize(9)
      .fillColor(hex(theme.muted))
      .text(`Levitron · ${label} · ${stamp}`);
    pdf.moveDown(1.5);

    if (document.kind === 'deck') {
      document.slides.forEach((slide, index) => {
        if (index > 0) pdf.moveDown(1.2);

        pdf.font(fonts.bold).fontSize(15).fillColor(hex(theme.ink)).text(`${index + 1}. ${slide.heading}`);
        pdf.moveDown(0.3);

        slide.bullets.forEach((bullet) => {
          pdf.font(fonts.regular).fontSize(11).fillColor(hex(theme.body)).text(bullet, {
            indent: 14,
            bullet: { character: '\u2022' },
            lineGap: 3,
          });
        });

        if (slide.notes) {
          pdf.moveDown(0.25);
          pdf.font(fonts.italic).fontSize(9).fillColor(hex(theme.muted)).text(`Speaker notes: ${slide.notes}`, {
            indent: 14,
            lineGap: 2,
          });
        }
      });
    } else {
      document.sections.forEach((section) => {
        pdf.font(fonts.bold).fontSize(14).fillColor(hex(theme.ink)).text(section.heading);
        pdf.moveDown(0.35);

        section.paragraphs.forEach((paragraph) => {
          pdf.font(fonts.regular).fontSize(11).fillColor(hex(theme.body)).text(paragraph, {
            lineGap: 4,
            align: 'justify',
          });
          pdf.moveDown(0.5);
        });

        pdf.moveDown(0.5);
      });
    }

    pdf.end();
  });
}
