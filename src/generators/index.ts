export { ProceduralGenerator } from './proceduralGenerator';

// Lazy-load LocalAiGenerator to prevent WebGPU-related code from blocking app startup.
// The main bundle stays lean; the AI generator is only loaded when actually needed.
export async function loadLocalAiGenerator() {
  const { LocalAiGenerator } = await import('./localAiGenerator');
  return new LocalAiGenerator();
}

// Re-export the type for use in type annotations
export type { LocalAiGenerator } from './localAiGenerator';
