import PDFDocument from 'pdfkit';

const INK = '#000000';
const BODY = '#262626';
const MUTED = '#6f6f6f';

function footerLine(document) {
  const stamp = new Date().toISOString().slice(0, 10);

  return `Levitron · ${document.kind === 'deck' ? 'Presentation outline' : 'Document'} · ${stamp}`;
}

export function renderPdf(document) {
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

    pdf.font('Helvetica-Bold').fontSize(26).fillColor(INK).text(document.title);
    pdf.moveDown(0.35);
    pdf.font('Helvetica').fontSize(9).fillColor(MUTED).text(footerLine(document));
    pdf.moveDown(1.6);

    if (document.kind === 'deck') {
      document.slides.forEach((slide, index) => {
        if (index > 0) pdf.moveDown(1.2);

        pdf.font('Helvetica-Bold').fontSize(15).fillColor(INK).text(`${index + 1}. ${slide.heading}`);
        pdf.moveDown(0.3);

        slide.bullets.forEach((bullet) => {
          pdf.font('Helvetica').fontSize(11).fillColor(BODY).text(bullet, {
            indent: 14,
            bullet: { character: '\u2022' },
            lineGap: 3,
          });
        });

        if (slide.notes) {
          pdf.moveDown(0.25);
          pdf.font('Helvetica-Oblique').fontSize(9).fillColor(MUTED).text(`Speaker notes: ${slide.notes}`, {
            indent: 14,
            lineGap: 2,
          });
        }
      });
    } else {
      document.sections.forEach((section) => {
        pdf.font('Helvetica-Bold').fontSize(14).fillColor(INK).text(section.heading);
        pdf.moveDown(0.35);

        section.paragraphs.forEach((paragraph) => {
          pdf.font('Helvetica').fontSize(11).fillColor(BODY).text(paragraph, { lineGap: 4, align: 'justify' });
          pdf.moveDown(0.5);
        });

        pdf.moveDown(0.5);
      });
    }

    pdf.end();
  });
}
