import { useState, useCallback } from 'react';
import { EXAMPLE_PROMPTS } from '../types';

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
  disabled: boolean;
  onSurprise: () => void;
}

export function PromptInput({ onGenerate, disabled, onSurprise }: PromptInputProps) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (prompt.trim() && !disabled) {
        onGenerate(prompt.trim());
      }
    },
    [prompt, disabled, onGenerate]
  );

  const handleChipClick = useCallback(
    (example: string) => {
      setPrompt(example);
      if (!disabled) {
        onGenerate(example);
      }
    },
    [disabled, onGenerate]
  );

  return (
    <div className="prompt-section">
      <form onSubmit={handleSubmit} className="prompt-form">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe an image... e.g. 'a mountain at sunset'"
          className="prompt-input"
          disabled={disabled}
        />
        <button type="submit" className="btn btn-primary" disabled={disabled || !prompt.trim()}>
          Generate
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={onSurprise}
          disabled={disabled}
        >
          Surprise Me
        </button>
      </form>

      <div className="prompt-chips">
        {EXAMPLE_PROMPTS.map((example) => (
          <button
            key={example}
            className="chip"
            onClick={() => handleChipClick(example)}
            disabled={disabled}
          >
            {example}
          </button>
        ))}
      </div>
    </div>
  );
}
