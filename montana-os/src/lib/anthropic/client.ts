import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

// Modelo por defecto para generación de descripciones
export const DEFAULT_MODEL = 'claude-sonnet-4-5';

// Modelo rápido y barato para tareas simples (clasificación, etc.)
export const FAST_MODEL = 'claude-haiku-4-5';
