import { useRef, useCallback } from 'react';

interface AsciiViewportProps {
  lines: string[];
  totalLines: number;
  isAnimating: boolean;
  isComplete: boolean;
  onReplay: () => void;
  onReset: () => void;
  onGenerateAgain: () => void;
  hasContent: boolean;
}

export function AsciiViewport({
  lines,
  totalLines,
  isAnimating,
  isComplete,
  onReplay,
  onReset,
  onGenerateAgain,
  hasContent,
}: AsciiViewportProps) {
  const preRef = useRef<HTMLPreElement>(null);

  const handleCopy = useCallback(async () => {
    if (!preRef.current) return;
    const text = preRef.current.innerText;
    await navigator.clipboard.writeText(text);
  }, []);

  const handleDownloadTxt = useCallback(() => {
    if (!preRef.current) return;
    const text = preRef.current.innerText;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ascii-art.txt';
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleDownloadPng = useCallback(async () => {
    if (!preRef.current) return;

    // Create a canvas to render the ASCII art as PNG
    const text = preRef.current.innerText;
    const textLines = text.split('\n');
    const fontSize = 10;
    const lineHeight = fontSize * 1.2;
    const charWidth = fontSize * 0.6;

    const maxLineLen = Math.max(...textLines.map((l) => l.length));
    const canvasWidth = Math.ceil(maxLineLen * charWidth) + 20;
    const canvasHeight = Math.ceil(textLines.length * lineHeight) + 20;

    const canvas = document.createElement('canvas');
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d')!;

    // Dark background
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Render text
    ctx.fillStyle = '#e6edf3';
    ctx.font = `${fontSize}px "Fira Code", "Cascadia Code", "JetBrains Mono", monospace`;
    ctx.textBaseline = 'top';

    textLines.forEach((line, i) => {
      ctx.fillText(line, 10, 10 + i * lineHeight);
    });

    // Download
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ascii-art.png';
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, []);

  return (
    <div className="ascii-viewport">
      <div className="viewport-header">
        <span className="viewport-label">
          ASCII Output
          {hasContent && (
            <span className="viewport-meta">
              {isAnimating
                ? ` (${lines.length}/${totalLines} lines)`
                : isComplete
                  ? ` (${totalLines} lines)`
                  : ''}
            </span>
          )}
        </span>

        {hasContent && (
          <div className="viewport-actions">
            <button className="btn btn-small" onClick={onReplay} title="Replay animation">
              Replay
            </button>
            <button className="btn btn-small" onClick={onGenerateAgain} title="Generate again">
              Again
            </button>
            <button className="btn btn-small" onClick={handleCopy} title="Copy ASCII to clipboard">
              Copy
            </button>
            <button className="btn btn-small" onClick={handleDownloadTxt} title="Download as .txt">
              .txt
            </button>
            <button className="btn btn-small" onClick={handleDownloadPng} title="Download as .png">
              .png
            </button>
            <button className="btn btn-small btn-danger" onClick={onReset} title="Clear output">
              Reset
            </button>
          </div>
        )}
      </div>

      <div className="viewport-content">
        {hasContent ? (
          <pre ref={preRef} className="ascii-output">
            {lines.join('\n')}
            {isAnimating && <span className="cursor-blink">_</span>}
          </pre>
        ) : (
          <div className="viewport-empty">
            <div className="viewport-empty-icon">{'>'}_</div>
            <p>Enter a prompt and click Generate to create ASCII art</p>
          </div>
        )}
      </div>
    </div>
  );
}
