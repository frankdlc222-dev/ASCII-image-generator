/**
 * Model caching utilities using Cache API / IndexedDB.
 * Used by localAiGenerator to persist downloaded model weights.
 */

const CACHE_NAME = 'ascii-gen-model-cache-v1';

export async function isCacheAvailable(): Promise<boolean> {
  return 'caches' in window;
}

export async function getCachedBlob(key: string): Promise<Blob | null> {
  if (!await isCacheAvailable()) return null;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(key);
    if (response) return response.blob();
    return null;
  } catch {
    return null;
  }
}

export async function setCachedBlob(key: string, blob: Blob): Promise<void> {
  if (!await isCacheAvailable()) return;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = new Response(blob);
    await cache.put(key, response);
  } catch {
    // Cache write failure is non-fatal
  }
}

export async function isCached(key: string): Promise<boolean> {
  if (!await isCacheAvailable()) return false;
  try {
    const cache = await caches.open(CACHE_NAME);
    const response = await cache.match(key);
    return response !== null;
  } catch {
    return false;
  }
}

export async function clearCache(): Promise<void> {
  if (!await isCacheAvailable()) return;
  await caches.delete(CACHE_NAME);
}
