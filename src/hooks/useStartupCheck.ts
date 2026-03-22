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
 */
export function useStartupCheck(): StartupState {
  const [state, setState] = useState<StartupState>({
    status: 'checking',
    message: 'Checking device capabilities...',
    webgpuAvailable: false,
  });

  useEffect(() => {
    let cancelled = false;

    console.log('[ASCII-Gen] Starting background capability check...');

    const timeoutId = setTimeout(() => {
      if (cancelled) return;
      console.warn('[ASCII-Gen] Capability check timed out after', STARTUP_TIMEOUT_MS, 'ms');
      setState({
        status: 'fallback',
        message: 'Capability check timed out. Using procedural fallback.',
        webgpuAvailable: false,
      });
    }, STARTUP_TIMEOUT_MS);

    detectCapabilities()
      .then((report) => {
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
      })
      .catch((err) => {
        if (cancelled) return;
        clearTimeout(timeoutId);
        console.error('[ASCII-Gen] Capability check failed:', err);
        setState({
          status: 'error',
          message: `Capability check failed: ${(err as Error).message}. Using procedural fallback.`,
          webgpuAvailable: false,
        });
      });

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, []);

  return state;
}
