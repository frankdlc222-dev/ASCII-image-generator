// Capability detection for WebGPU and local AI inference

export interface CapabilityReport {
  webgpu: boolean;
  gpu: GPUAdapter | null;
  gpuName: string;
  reason: string;
}

let cachedReport: CapabilityReport | null = null;

/** Race a promise against a timeout. */
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}

export async function detectCapabilities(): Promise<CapabilityReport> {
  if (cachedReport) return cachedReport;

  console.log('[ASCII-Gen] Detecting WebGPU capabilities...');

  // Guard against missing browser APIs
  try {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      console.log('[ASCII-Gen] Not in a browser environment.');
      cachedReport = {
        webgpu: false,
        gpu: null,
        gpuName: '',
        reason: 'Not in a browser environment.',
      };
      return cachedReport;
    }

    if (!navigator.gpu) {
      console.log('[ASCII-Gen] navigator.gpu not available.');
      cachedReport = {
        webgpu: false,
        gpu: null,
        gpuName: '',
        reason: 'WebGPU is not available in this browser.',
      };
      return cachedReport;
    }

    const adapter = await withTimeout(
      navigator.gpu.requestAdapter(),
      3000,
      'WebGPU adapter request'
    );

    if (!adapter) {
      console.log('[ASCII-Gen] No WebGPU adapter found.');
      cachedReport = {
        webgpu: false,
        gpu: null,
        gpuName: '',
        reason: 'No WebGPU adapter found.',
      };
      return cachedReport;
    }

    let gpuName = 'Unknown GPU';
    try {
      const info = adapter.info;
      gpuName = info?.device || info?.description || 'Unknown GPU';
    } catch {
      // Some browsers may not support adapter.info
    }

    console.log('[ASCII-Gen] WebGPU available:', gpuName);
    cachedReport = {
      webgpu: true,
      gpu: adapter,
      gpuName,
      reason: `WebGPU available: ${gpuName}`,
    };
    return cachedReport;
  } catch (e) {
    console.warn('[ASCII-Gen] WebGPU detection failed:', e);
    cachedReport = {
      webgpu: false,
      gpu: null,
      gpuName: '',
      reason: `WebGPU detection failed: ${(e as Error).message}`,
    };
    return cachedReport;
  }
}

export function resetCapabilityCache() {
  cachedReport = null;
}
