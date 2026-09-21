import { Document as DocxDocument, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';

const MUTED = '6F6F6F';

export async function renderDocx(document) {
  const stamp = new Date().toISOString().slice(0, 10);

  const children = [
    new Paragraph({ text: document.title, heading: HeadingLevel.TITLE }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Levitron · ${document.kind === 'deck' ? 'Presentation outline' : 'Document'} · ${stamp}`,
          size: 18,
          color: MUTED,
        }),
      ],
      spacing: { after: 320 },
    }),
  ];

  if (document.kind === 'deck') {
    document.slides.forEach((slide, index) => {
      children.push(
        new Paragraph({
          text: `${index + 1}. ${slide.heading}`,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 120 },
        }),
      );

      slide.bullets.forEach((bullet) => {
        children.push(new Paragraph({ text: bullet, bullet: { level: 0 }, spacing: { after: 80 } }));
      });

      if (slide.notes) {
        children.push(
          new Paragraph({
            children: [new TextRun({ text: `Speaker notes: ${slide.notes}`, italics: true, size: 18, color: MUTED })],
            spacing: { before: 120, after: 160 },
          }),
        );
      }
    });
  } else {
    document.sections.forEach((section) => {
      children.push(
        new Paragraph({
          text: section.heading,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 280, after: 120 },
        }),
      );

      section.paragraphs.forEach((paragraph) => {
        children.push(new Paragraph({ text: paragraph, spacing: { after: 200 } }));
      });
    });
  }

  const docx = new DocxDocument({ sections: [{ children }] });

  return Packer.toBuffer(docx);
}
