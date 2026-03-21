import { useState, useEffect, useCallback, useRef } from 'react';
import type { AsciiResult } from '../types';

interface UseAsciiAnimationResult {
  visibleLines: string[];
  isAnimating: boolean;
  isComplete: boolean;
  replay: () => void;
}

export function useAsciiAnimation(
  asciiResult: AsciiResult | null,
  speed: number,
  shouldAnimate: boolean
): UseAsciiAnimationResult {
  const [revealedCount, setRevealedCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationId, setAnimationId] = useState(0);
  const timerRef = useRef<number | null>(null);

  const totalLines = asciiResult?.lines.length ?? 0;
  const isComplete = revealedCount >= totalLines && totalLines > 0;

  useEffect(() => {
    if (!asciiResult || !shouldAnimate) return;

    setRevealedCount(0);
    setIsAnimating(true);

    const intervalMs = Math.max(10, 1000 / speed);
    let count = 0;

    const tick = () => {
      count++;
      setRevealedCount(count);
      if (count >= asciiResult.lines.length) {
        setIsAnimating(false);
        return;
      }
      timerRef.current = window.setTimeout(tick, intervalMs);
    };

    timerRef.current = window.setTimeout(tick, intervalMs);

    return () => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [asciiResult, speed, shouldAnimate, animationId]);

  const replay = useCallback(() => {
    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setRevealedCount(0);
    setIsAnimating(false);
    setAnimationId((id) => id + 1);
  }, []);

  const visibleLines = asciiResult
    ? asciiResult.lines.slice(0, revealedCount)
    : [];

  return {
    visibleLines,
    isAnimating,
    isComplete,
    replay,
  };
}
