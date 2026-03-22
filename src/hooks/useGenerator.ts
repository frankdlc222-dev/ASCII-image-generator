import { useState, useRef, useCallback } from 'react';
import type {
  AppStatus,
  GenerationMode,
  GenerationProgress,
  GenerationOptions,
  Generator,
  AsciiResult,
  AsciiOptions,
} from '../types';
import { LocalAiGenerator, ProceduralGenerator } from '../generators/index';
import { imageToAscii } from '../lib/asciiConverter';

interface UseGeneratorResult {
  status: AppStatus;
  statusMessage: string;
  mode: GenerationMode | null;
  progress: GenerationProgress | null;
  asciiResult: AsciiResult | null;
  error: string | null;
  generate: (prompt: string, asciiOpts: AsciiOptions, forceFallback: boolean, seed?: string) => Promise<void>;
  reset: () => void;
}

export function useGenerator(): UseGeneratorResult {
  const [status, setStatus] = useState<AppStatus>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [mode, setMode] = useState<GenerationMode | null>(null);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [asciiResult, setAsciiResult] = useState<AsciiResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const localAiRef = useRef<LocalAiGenerator | null>(null);
  const proceduralRef = useRef<ProceduralGenerator | null>(null);

  const getProceduralGenerator = useCallback(() => {
    if (!proceduralRef.current) {
      proceduralRef.current = new ProceduralGenerator();
    }
    return proceduralRef.current;
  }, []);

  const getLocalAiGenerator = useCallback(() => {
    if (!localAiRef.current) {
      localAiRef.current = new LocalAiGenerator();
    }
    return localAiRef.current;
  }, []);

  const generate = useCallback(
    async (prompt: string, asciiOpts: AsciiOptions, forceFallback: boolean, seed?: string) => {
      setError(null);
      setAsciiResult(null);
      setProgress(null);

      const imgWidth = 512;
      const imgHeight = 512;

      const genOptions: GenerationOptions = {
        prompt,
        width: imgWidth,
        height: imgHeight,
        seed: seed ? parseInt(seed, 10) || undefined : undefined,
      };

      let generator: Generator;
      let usedMode: GenerationMode;

      if (forceFallback) {
        console.log('[ASCII-Gen] Forced procedural fallback.');
        setStatus('fallback-activated');
        setStatusMessage('Using procedural fallback (forced).');
        generator = getProceduralGenerator();
        usedMode = 'procedural';
      } else {
        setStatus('checking-capability');
        setStatusMessage('Checking device capabilities...');

        console.log('[ASCII-Gen] Checking local AI support for generation...');
        const localAi = getLocalAiGenerator();
        const supported = await localAi.isSupported();

        if (supported) {
          try {
            setStatus('initializing-model');
            setStatusMessage('Initializing local AI model...');

            await localAi.initialize((p) => {
              setProgress(p);
              if (p.stage === 'downloading' || p.stage === 'loading-model') {
                setStatus('downloading-model');
              }
              setStatusMessage(p.message);
            });

            generator = localAi;
            usedMode = 'local-ai';
            setMode('local-ai');
          } catch (e) {
            console.warn('Local AI init failed, falling back:', e);
            setStatus('fallback-activated');
            setStatusMessage(
              `Local AI unavailable: ${(e as Error).message}. Using procedural fallback.`
            );
            generator = getProceduralGenerator();
            usedMode = 'procedural';
          }
        } else {
          setStatus('fallback-activated');
          setStatusMessage('WebGPU not available. Using procedural fallback.');
          generator = getProceduralGenerator();
          usedMode = 'procedural';
        }
      }

      setMode(usedMode);

      try {
        setStatus('generating');
        setStatusMessage(
          usedMode === 'local-ai'
            ? 'Generating image with local AI...'
            : 'Generating procedural image...'
        );

        const imageData = await generator.generate(genOptions);

        setStatus('converting');
        setStatusMessage('Converting to ASCII art...');

        await new Promise((r) => setTimeout(r, 50));

        const ascii = imageToAscii(imageData, asciiOpts);
        setAsciiResult(ascii);

        setStatus('animating');
        setStatusMessage('Revealing ASCII art...');
      } catch (e) {
        if (usedMode === 'local-ai') {
          console.warn('Local AI generation failed, trying fallback:', e);
          setStatus('fallback-activated');
          setStatusMessage('Local AI generation failed. Switching to procedural fallback...');
          setMode('procedural');

          try {
            const fallback = getProceduralGenerator();
            const imageData = await fallback.generate(genOptions);

            setStatus('converting');
            setStatusMessage('Converting to ASCII art...');

            await new Promise((r) => setTimeout(r, 50));

            const ascii = imageToAscii(imageData, asciiOpts);
            setAsciiResult(ascii);

            setStatus('animating');
            setStatusMessage('Revealing ASCII art...');
          } catch (fallbackError) {
            setStatus('error');
            setError(`Generation failed: ${(fallbackError as Error).message}`);
            setStatusMessage('Generation failed.');
          }
        } else {
          setStatus('error');
          setError(`Generation failed: ${(e as Error).message}`);
          setStatusMessage('Generation failed.');
        }
      }
    },
    [getLocalAiGenerator, getProceduralGenerator]
  );

  const reset = useCallback(() => {
    setStatus('idle');
    setStatusMessage('');
    setMode(null);
    setProgress(null);
    setAsciiResult(null);
    setError(null);
  }, []);

  return {
    status,
    statusMessage,
    mode,
    progress,
    asciiResult,
    error,
    generate,
    reset,
  };
}
