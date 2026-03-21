// ─── Generation Types ────────────────────────────────────────────

export type GenerationMode = 'local-ai' | 'procedural';

export interface GenerationOptions {
  prompt: string;
  width: number;
  height: number;
  seed?: number;
}

export interface GenerationResult {
  imageData: ImageData;
  mode: GenerationMode;
  elapsed: number;
}

export interface GenerationProgress {
  stage: string;
  progress: number; // 0-100
  message: string;
}

// ─── Generator Interface ────────────────────────────────────────

export interface Generator {
  readonly name: string;
  readonly mode: GenerationMode;
  initialize(onProgress?: (p: GenerationProgress) => void): Promise<void>;
  isSupported(): Promise<boolean>;
  generate(options: GenerationOptions): Promise<ImageData>;
  dispose(): void;
}

// ─── ASCII Types ────────────────────────────────────────────────

export type CharacterRamp = 'standard' | 'blocks' | 'minimal';

export const CHARACTER_RAMPS: Record<CharacterRamp, string> = {
  standard: '@%#*+=-:. ',
  blocks: '█▓▒░ ',
  minimal: '#*:. ',
};

export interface AsciiOptions {
  width: number;
  charRamp: CharacterRamp;
  edgeEnhance: boolean;
}

export interface AsciiResult {
  lines: string[];
  width: number;
  height: number;
}

// ─── App State ──────────────────────────────────────────────────

export type AppStatus =
  | 'idle'
  | 'checking-capability'
  | 'downloading-model'
  | 'initializing-model'
  | 'generating'
  | 'converting'
  | 'animating'
  | 'complete'
  | 'fallback-activated'
  | 'error';

export interface AppState {
  status: AppStatus;
  statusMessage: string;
  mode: GenerationMode | null;
  asciiLines: string[];
  revealedLines: number;
  error: string | null;
  progress: GenerationProgress | null;
}

// ─── Controls ───────────────────────────────────────────────────

export interface ControlValues {
  outputWidth: number;
  animationSpeed: number;
  charRamp: CharacterRamp;
  edgeEnhance: boolean;
  seed: string;
  forceFallback: boolean;
}

export const DEFAULT_CONTROLS: ControlValues = {
  outputWidth: 120,
  animationSpeed: 30,
  charRamp: 'standard',
  edgeEnhance: false,
  seed: '',
  forceFallback: false,
};

export const EXAMPLE_PROMPTS = [
  'a mountain at sunset',
  'a robot face',
  'a cat under the moon',
  'a castle on a hill',
  'a spaceship in space',
  'a palm tree by the ocean',
];
