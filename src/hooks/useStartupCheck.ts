import { useState, useEffect } from 'react';
import { detectCapabilities } from '../lib/capability';

export type StartupStatus = 'checking' | 'ready' | 'fallback' | 'error';

export interface StartupState {
  status: StartupStatus;
  message: string;
  webgpuAvailable: boolean;
}

const STARTUP_TIMEOUT_MS = 4000;

/**
 * Background startup check — runs capability detection after mount
 * with a timeout so the UI is never blocked.
 * All errors are caught internally — this hook will never throw.
 */
export function useStartupCheck(): StartupState {
  const [state, setState] = useState<StartupState>({
    status: 'checking',
    message: 'Checking device capabilities...',
    webgpuAvailable: false,
  });

  useEffect(() => {
    let cancelled = false;

    console.log('[ASCII-Gen] Optional feature init starting: capability check...');

    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      console.warn('[ASCII-Gen] Optional feature init failed: capability check timed out after', STARTUP_TIMEOUT_MS, 'ms — fallback activated.');
      setState({
        status: 'fallback',
        message: 'Capability check timed out. Using procedural fallback.',
        webgpuAvailable: false,
      });
    }, STARTUP_TIMEOUT_MS);

    // Wrap entire detection in try/catch to guarantee no unhandled errors
    const runCheck = async () => {
      try {
        const report = await detectCapabilities();
        if (cancelled) return;
        clearTimeout(timeoutId);
        console.log('[ASCII-Gen] Capability check complete:', report);

        if (report.webgpu) {
          setState({
            status: 'ready',
            message: `Ready — GPU: ${report.gpuName}`,
            webgpuAvailable: true,
          });
        } else {
          setState({
            status: 'fallback',
            message: `Local AI unavailable: ${report.reason}. Using procedural fallback.`,
            webgpuAvailable: false,
          });
        }
      } catch (err) {
        if (cancelled) return;
        clearTimeout(timeoutId);
        console.error('[ASCII-Gen] Optional feature init failed: capability check error:', err);
        setState({
          status: 'error',
          message: `Capability check failed: ${(err as Error).message}. Using procedural fallback.`,
          webgpuAvailable: false,
        });
      }
    };

    runCheck();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
