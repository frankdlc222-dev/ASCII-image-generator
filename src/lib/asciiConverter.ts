import type { AsciiOptions, AsciiResult } from '../types';
import { CHARACTER_RAMPS } from '../types';

/**
 * Convert ImageData to ASCII art.
 * Handles aspect ratio correction for monospace characters (~2:1 height:width).
 */
export function imageToAscii(
  imageData: ImageData,
  options: AsciiOptions
): AsciiResult {
  const { width: targetCols, charRamp, edgeEnhance } = options;
  const ramp = CHARACTER_RAMPS[charRamp];
  const srcW = imageData.width;
  const srcH = imageData.height;

  // Character cells are roughly 2x taller than wide
  const charAspect = 0.5;
  const cellW = srcW / targetCols;
  const cellH = cellW / charAspect;
  const targetRows = Math.floor(srcH / cellH);

  if (targetRows <= 0 || targetCols <= 0) {
    return { lines: [''], width: 0, height: 0 };
  }

  // Pre-compute grayscale and optional edge map
  const gray = computeGrayscale(imageData);
  const edge = edgeEnhance ? computeSobel(gray, srcW, srcH) : null;

  const lines: string[] = [];

  for (let row = 0; row < targetRows; row++) {
    let line = '';
    for (let col = 0; col < targetCols; col++) {
      const sx = Math.floor(col * cellW);
      const sy = Math.floor(row * cellH);
      const ex = Math.min(Math.floor((col + 1) * cellW), srcW);
      const ey = Math.min(Math.floor((row + 1) * cellH), srcH);

      // Average brightness in this cell
      let sum = 0;
      let count = 0;
      for (let y = sy; y < ey; y++) {
        for (let x = sx; x < ex; x++) {
          sum += gray[y * srcW + x];
          count++;
        }
      }
      let brightness = count > 0 ? sum / count : 0;

      // Blend with edge if enabled
      if (edge) {
        let edgeSum = 0;
        for (let y = sy; y < ey; y++) {
          for (let x = sx; x < ex; x++) {
            edgeSum += edge[y * srcW + x];
          }
        }
        const edgeVal = count > 0 ? edgeSum / count : 0;
        // Darken areas with strong edges for sharper detail
        brightness = Math.max(0, brightness - edgeVal * 0.5);
      }

      // Map brightness to character (bright = sparse, dark = dense)
      const idx = Math.floor((1 - brightness / 255) * (ramp.length - 1));
      line += ramp[Math.min(idx, ramp.length - 1)];
    }
    lines.push(line);
  }

  return { lines, width: targetCols, height: targetRows };
}

function computeGrayscale(imageData: ImageData): Float32Array {
  const { data, width, height } = imageData;
  const gray = new Float32Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return gray;
}

function computeSobel(
  gray: Float32Array,
  w: number,
  h: number
): Float32Array {
  const edge = new Float32Array(w * h);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const tl = gray[(y - 1) * w + (x - 1)];
      const t = gray[(y - 1) * w + x];
      const tr = gray[(y - 1) * w + (x + 1)];
      const l = gray[y * w + (x - 1)];
      const r = gray[y * w + (x + 1)];
      const bl = gray[(y + 1) * w + (x - 1)];
      const b = gray[(y + 1) * w + x];
      const br = gray[(y + 1) * w + (x + 1)];

      const gx = -tl + tr - 2 * l + 2 * r - bl + br;
      const gy = -tl - 2 * t - tr + bl + 2 * b + br;
      edge[y * w + x] = Math.min(255, Math.sqrt(gx * gx + gy * gy));
    }
  }
  return edge;
}
