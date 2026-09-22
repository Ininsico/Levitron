import { generateWithAi, isAiConfigured, aiModelName } from './ai.js';
import { generateDraft } from './draft.js';

export function generatorStatus() {
  return isAiConfigured()
    ? { engine: 'ai', model: aiModelName() }
    : { engine: 'draft', model: '', reason: 'No model is configured for this server.' };
}

/**
 * Produces a deck or document outline.
 *
 * When a model is configured but the call fails, this still returns a usable
 * outline — but it records *why* in `fallbackReason`, which is stored on the
 * document and shown in the UI. Silently substituting template output is how a
 * whole deck ends up identical to the last one with nobody able to tell why.
 */
export async function generateOutline(input) {
  if (!isAiConfigured()) {
    const draft = generateDraft(input);

    return { ...draft, fallbackReason: 'No model is configured for this server.' };
  }

  try {
    const generated = await generateWithAi(input);

    return { ...generated, fallbackReason: '' };
  } catch (error) {
    console.warn(`[generator] model call failed, using the built-in engine: ${error.message}`);

    const draft = generateDraft(input);

    return { ...draft, fallbackReason: error.message };
  }
}
