// Capability detection for WebGPU and local AI inference

export interface CapabilityReport {
  webgpu: boolean;
  gpu: GPUAdapter | null;
  gpuName: string;
  reason: string;
}

let cachedReport: CapabilityReport | null = null;

export async function detectCapabilities(): Promise<CapabilityReport> {
  if (cachedReport) return cachedReport;

  // Check WebGPU API availability
  if (!navigator.gpu) {
    cachedReport = {
      webgpu: false,
      gpu: null,
      gpuName: '',
      reason: 'WebGPU is not available in this browser.',
    };
    return cachedReport;
  }

  try {
    const adapter = await navigator.gpu.requestAdapter();
    if (!adapter) {
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

    cachedReport = {
      webgpu: true,
      gpu: adapter,
      gpuName,
      reason: `WebGPU available: ${gpuName}`,
    };
    return cachedReport;
  } catch (e) {
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
