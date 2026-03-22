import { useState, useCallback } from 'react';
import { PromptInput } from './components/PromptInput';
import { ControlsPanel } from './components/ControlsPanel';
import { StatusPanel } from './components/StatusPanel';
import { AsciiViewport } from './components/AsciiViewport';
import { GenerationModeBadge } from './components/GenerationModeBadge';
import { StartupBadge } from './components/StartupBadge';
import { useGenerator } from './hooks/useGenerator';
import { useAsciiAnimation } from './hooks/useAsciiAnimation';
import { useStartupCheck } from './hooks/useStartupCheck';
import type { ControlValues, AsciiOptions } from './types';
import { DEFAULT_CONTROLS, EXAMPLE_PROMPTS } from './types';
import './App.css';

function App() {
  const [controls, setControls] = useState<ControlValues>(DEFAULT_CONTROLS);
  const [lastPrompt, setLastPrompt] = useState('');

  // Background startup check — non-blocking
  const startup = useStartupCheck();

  const {
    status,
    statusMessage,
    mode,
    progress,
    asciiResult,
    error,
    generate,
    reset,
  } = useGenerator();

  const shouldAnimate = status === 'animating';
  const { visibleLines, isAnimating, isComplete, replay } = useAsciiAnimation(
    asciiResult,
    controls.animationSpeed,
    shouldAnimate
  );

  const isWorking = [
    'checking-capability',
    'downloading-model',
    'initializing-model',
    'generating',
    'converting',
  ].includes(status);

  const handleGenerate = useCallback(
    (prompt: string) => {
      setLastPrompt(prompt);
      const asciiOpts: AsciiOptions = {
        width: controls.outputWidth,
        charRamp: controls.charRamp,
        edgeEnhance: controls.edgeEnhance,
      };
      // If startup detected no WebGPU, force fallback automatically
      const forceFallback = controls.forceFallback || (!startup.webgpuAvailable && startup.status !== 'checking');
      generate(prompt, asciiOpts, forceFallback, controls.seed);
    },
    [controls, generate, startup.webgpuAvailable, startup.status]
  );

  const handleSurprise = useCallback(() => {
    const randomPrompt =
      EXAMPLE_PROMPTS[Math.floor(Math.random() * EXAMPLE_PROMPTS.length)];
    handleGenerate(randomPrompt);
  }, [handleGenerate]);

  const handleGenerateAgain = useCallback(() => {
    if (lastPrompt) {
      handleGenerate(lastPrompt);
    }
  }, [lastPrompt, handleGenerate]);

  const handleReset = useCallback(() => {
    reset();
    setLastPrompt('');
  }, [reset]);

  const hasContent = visibleLines.length > 0 || (asciiResult?.lines.length ?? 0) > 0;

  const displayLines = isAnimating ? visibleLines : (asciiResult?.lines ?? []);

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">
          <span className="title-accent">{'>'}</span> ASCII Image Generator
          <span className="version-badge">v1.5</span>
        </h1>
        <p className="app-description">
          Type a prompt, generate an image locally in your browser, and watch it transform into ASCII art.
        </p>
        <div className="badge-row">
          <StartupBadge status={startup.status} message={startup.message} />
          <GenerationModeBadge mode={mode} />
        </div>
      </header>

      <main className="app-main">
        <div className="app-content">
          <PromptInput
            onGenerate={handleGenerate}
            disabled={isWorking}
            onSurprise={handleSurprise}
          />

          <StatusPanel
            status={status}
            message={statusMessage}
            progress={progress}
            error={error}
          />

          <AsciiViewport
            lines={displayLines}
            totalLines={asciiResult?.lines.length ?? 0}
            isAnimating={isAnimating}
            isComplete={isComplete}
            onReplay={replay}
            onReset={handleReset}
            onGenerateAgain={handleGenerateAgain}
            hasContent={hasContent}
          />
        </div>

        <aside className="app-sidebar">
          <ControlsPanel
            controls={controls}
            onChange={setControls}
            disabled={isWorking}
          />
        </aside>
      </main>

      <footer className="app-footer">
        <span>ASCII Image Generator v1.5</span>
        <span className="footer-sep">|</span>
        <span>Runs entirely in your browser</span>
      </footer>
    </div>
  );
}

export default App;
