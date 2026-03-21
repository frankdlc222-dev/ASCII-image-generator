import type { GenerationMode } from '../types';

interface GenerationModeBadgeProps {
  mode: GenerationMode | null;
}

export function GenerationModeBadge({ mode }: GenerationModeBadgeProps) {
  if (!mode) return null;

  const isAi = mode === 'local-ai';

  return (
    <span className={`mode-badge ${isAi ? 'mode-ai' : 'mode-procedural'}`}>
      {isAi ? 'Local AI' : 'Procedural Fallback'}
    </span>
  );
}
