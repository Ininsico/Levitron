import { contentTitle, structureDeckFromContent, structureDocumentFromContent } from './content.js';

const MAX_TOPIC_IN_HEADING = 58;

// Offline drafts still get icons, so the exported deck looks deliberate even
// with no model configured.
const DRAFT_ICONS = [
  'presentation',
  'target',
  'search',
  'lightbulb',
  'workflow',
  'bar-chart-3',
  'shield-check',
  'trending-up',
  'dollar-sign',
  'route',
  'scale',
  'flag',
  'rocket',
];

function withIcons(slides) {
  return slides.map((slide, index) => ({ ...slide, icon: DRAFT_ICONS[index % DRAFT_ICONS.length] }));
}

function phrase(topic) {
  const cleaned = String(topic).replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '');

  if (cleaned.length <= MAX_TOPIC_IN_HEADING) return cleaned;

  return `${cleaned.slice(0, MAX_TOPIC_IN_HEADING).trimEnd()}…`;
}

function titleCase(value) {
  const small = new Set(['a', 'an', 'and', 'as', 'at', 'but', 'by', 'for', 'from', 'in', 'of', 'on', 'or', 'the', 'to', 'vs', 'with']);

  return value
    .split(' ')
    .map((word, index) => {
      if (index > 0 && small.has(word.toLowerCase())) return word.toLowerCase();

      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function draftTitle(topic) {
  const firstClause = String(topic).split(/[.\n]/)[0].trim();
  const base = firstClause.length > 5 ? firstClause : topic;

  return titleCase(phrase(base)).slice(0, 120);
}

function deckSkeleton(subject, audience) {
  const audienceLine = audience ? ` Prepared for ${audience}.` : '';

  const opening = [
    {
      heading: subject,
      bullets: [`Why this matters right now${audience ? ` for ${audience.toLowerCase()}` : ''}`, 'Where we are, where we need to be', 'What we are asking for'],
      notes: `Set the frame for the room.${audienceLine}`,
    },
    {
      heading: "What we'll cover",
      bullets: ['The situation today', 'The approach', 'Evidence and numbers', 'Risks and trade-offs', 'Next steps'],
      notes: 'Keep this to thirty seconds — it is a map, not a chapter.',
    },
  ];

  const middle = [
    {
      heading: 'The situation today',
      bullets: [`${subject} is managed by hand today`, 'Work is duplicated across teams', 'Nobody has a single source of truth'],
    },
    {
      heading: 'Why now',
      bullets: ['The cost of waiting compounds', 'Expectations have already moved', 'The tools are finally good enough'],
    },
    {
      heading: 'The approach',
      bullets: ['Start with the highest-volume workflow', 'Automate the repeatable parts', 'Keep humans on the judgement calls'],
    },
    {
      heading: 'How it works',
      bullets: ['Input is captured once, at the source', 'Structure is generated, then edited', 'Output lands in the formats people already use'],
    },
    {
      heading: 'What changes for the team',
      bullets: ['Less time rebuilding the same artefact', 'More time on the argument itself', 'Consistent output regardless of who runs it'],
    },
    {
      heading: 'Evidence so far',
      bullets: ['Measure the week before and the week after', 'Track turnaround time, not effort', 'Report exceptions, not averages'],
    },
    {
      heading: 'Risks and trade-offs',
      bullets: ['Quality drift if output ships unread', 'Model or vendor dependency', 'Migration cost for existing material'],
    },
    {
      heading: 'What success looks like',
      bullets: ['Turnaround measured in minutes', 'Output that needs editing, not rewriting', 'Adoption without a mandate'],
    },
    {
      heading: 'Cost and effort',
      bullets: ['Build once, reuse indefinitely', 'Runs on hardware we already own', 'No per-seat licensing'],
    },
    {
      heading: 'Alternatives considered',
      bullets: ['Do nothing — the current cost continues', 'Buy a hosted tool — recurring spend, less control', 'Build in-house — slower, narrower'],
    },
  ];

  const closing = [
    {
      heading: 'Where we go from here',
      bullets: ['Pilot with one team for two weeks', 'Review the numbers together', 'Decide whether to widen it'],
    },
    {
      heading: 'The ask',
      bullets: ['Approval to run the pilot', 'One engineer, part time', 'A decision date on the calendar'],
      notes: 'Be explicit. An unclear ask ends the meeting with no decision.',
    },
  ];

  return { opening, middle, closing };
}

function documentSkeleton(subject, audience, tone) {
  const subjectLower = subject.charAt(0).toLowerCase() + subject.slice(1);
  const toneNote = tone ? ` ${tone.charAt(0).toUpperCase()}${tone.slice(1)} throughout.` : '';

  return [
    {
      heading: 'Executive summary',
      paragraphs: [
        `This document sets out a plan for ${subjectLower}.${audience ? ` It is written for ${audience}.` : ''}`,
        'It covers the current position, the recommended approach, what it costs, and what happens next. The recommendation is to begin with a two-week pilot before committing further.',
      ],
    },
    {
      heading: 'Background',
      paragraphs: [
        `Work on ${subjectLower} is currently handled manually, which makes turnaround unpredictable and quality dependent on whoever happens to be available.`,
        'That is workable at low volume and breaks down as soon as demand grows or someone leaves. The result is duplicated effort and inconsistent output.',
      ],
    },
    {
      heading: 'Recommended approach',
      paragraphs: [
        'Capture the input once, at the point it is created, rather than reconstructing it later.',
        'Generate a first draft from that input, then have a person review and edit it. The draft is a starting point, not the finished artefact.',
        'Publish into the formats people already use, so adoption does not depend on changing anyone\u2019s habits.',
      ],
    },
    {
      heading: 'Scope',
      paragraphs: [
        `In scope: the repeatable parts of ${subjectLower} — structure, formatting and first drafts.`,
        'Out of scope: final editorial judgement, anything requiring sign-off, and one-off creative work.',
      ],
    },
    {
      heading: 'Implementation plan',
      paragraphs: [
        'Weeks one and two: pilot with a single team, measuring turnaround time and edit effort before and after.',
        'Weeks three and four: review the results, fix what surfaced, and decide whether to widen the pilot.',
        'Beyond that: roll out to the remaining teams, or stop — the pilot is designed to be a real decision point.',
      ],
    },
    {
      heading: 'Risks and mitigations',
      paragraphs: [
        'Quality drift if generated output is sent without review. Mitigation: review stays mandatory, and the workflow makes it the default path.',
        'Dependency on a model or vendor. Mitigation: the generator talks to any OpenAI-compatible endpoint, and can be self-hosted.',
        'Migration cost for existing material. Mitigation: old documents are left alone; the change applies to new work only.',
      ],
    },
    {
      heading: 'Cost and effort',
      paragraphs: [
        'One engineer part time for four weeks, plus a small amount of review time from the pilot team.',
        'Running costs are limited to the model endpoint, which is optional — the built-in generator produces a usable draft with no external calls at all.',
      ],
    },
    {
      heading: 'Recommendation',
      paragraphs: [
        `Approve the two-week pilot for ${subjectLower}.`,
        'It is bounded in time and cost, it produces the numbers needed for a real decision, and doing nothing leaves the current cost in place.',
      ],
    },
  ];
}

export function generateDraft({
  topic,
  content = '',
  kind,
  audience = '',
  tone = '',
  slideCount = 10,
}) {
  // When the author supplied their own material, structure that instead of
  // inventing a skeleton — their words take priority over the template.
  if (String(content).trim()) {
    const maxSlides = Math.max(4, Math.min(30, Number(slideCount) || 10));

    if (kind === 'deck') {
      return {
        title: contentTitle(content, topic),
        source: 'draft',
        model: '',
        slides: withIcons(structureDeckFromContent(content, { maxSlides })),
        sections: [],
      };
    }

    return {
      title: contentTitle(content, topic),
      source: 'draft',
      model: '',
      slides: [],
      sections: structureDocumentFromContent(content),
    };
  }

  const subject = phrase(topic) || 'Untitled';
  const title = draftTitle(topic);

  if (kind === 'deck') {
    const { opening, middle, closing } = deckSkeleton(subject, audience);
    const wanted = Math.max(4, Math.min(30, Number(slideCount) || 10));
    const middleCount = Math.max(1, wanted - opening.length - closing.length);

    const chosen = [];
    for (let index = 0; index < middleCount; index += 1) {
      chosen.push(middle[index % middle.length]);
    }

    const slides = withIcons(
      [...opening, ...chosen, ...closing].map((slide) => ({
        heading: slide.heading,
        bullets: slide.bullets ?? [],
        notes: slide.notes ?? '',
      })),
    );

    return { title, source: 'draft', model: '', slides, sections: [] };
  }

  const sections = documentSkeleton(subject, audience, tone);

  return {
    title,
    source: 'draft',
    model: '',
    slides: [],
    sections: sections.map((section) => ({
      heading: section.heading,
      paragraphs: section.paragraphs ?? [],
    })),
  };
}
