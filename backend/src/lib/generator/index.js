import { generateWithAi, isAiConfigured, aiModelName } from './ai.js';
import { generateDraft } from './draft.js';

export function generatorStatus() {
  return isAiConfigured()
    ? { engine: 'ai', model: aiModelName() }
    : { engine: 'draft', model: '' };
}

/**
 * Produces a deck or document outline. Uses the configured model when there is
 * one, and falls back to the built-in engine when there is not — or when the
 * model call fails — so a broken key never blocks the whole feature.
 */
export async function generateOutline(input) {
  if (isAiConfigured()) {
    try {
      return await generateWithAi(input);
    } catch (error) {
      console.warn(`[generator] model call failed, using the built-in engine: ${error.message}`);
    }
  }

  return generateDraft(input);
}
