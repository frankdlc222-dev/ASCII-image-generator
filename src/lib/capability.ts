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

  // Check WebGPU API availability
  if (typeof navigator === 'undefined' || !navigator.gpu) {
    console.log('[ASCII-Gen] navigator.gpu not available.');
    cachedReport = {
      webgpu: false,
      gpu: null,
      gpuName: '',
      reason: 'WebGPU is not available in this browser.',
    };
    return cachedReport;
  }

  try {
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

    const info = adapter.info;
    const gpuName = info?.device || info?.description || 'Unknown GPU';

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
