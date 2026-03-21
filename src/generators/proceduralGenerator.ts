import type { Generator, GenerationMode, GenerationOptions, GenerationProgress } from '../types';
import { createOffscreenCanvas } from '../lib/imageToCanvas';

/**
 * Procedural scene generator — always-available fallback.
 * Parses prompts for keywords and renders stylized scenes on canvas.
 */
export class ProceduralGenerator implements Generator {
  readonly name = 'Procedural Fallback';
  readonly mode: GenerationMode = 'procedural';

  async initialize(_onProgress?: (p: GenerationProgress) => void): Promise<void> {
    // No initialization needed
  }

  async isSupported(): Promise<boolean> {
    return true; // Always available
  }

  async generate(options: GenerationOptions): Promise<ImageData> {
    const { prompt, width, height, seed } = options;
    const { canvas, ctx } = createOffscreenCanvas(width, height);

    // Seeded random
    const rng = createRng(seed ?? Math.floor(Math.random() * 999999));

    const scene = classifyScene(prompt);
    renderScene(ctx, width, height, scene, rng);

    return ctx.getImageData(0, 0, canvas.width, canvas.height);
  }

  dispose(): void {}
}

// ─── Scene Classification ───────────────────────────────────────

type SceneType =
  | 'sunset-landscape'
  | 'mountain'
  | 'moon-night'
  | 'robot'
  | 'cat'
  | 'castle'
  | 'spaceship'
  | 'tree-ocean'
  | 'forest'
  | 'city'
  | 'abstract';

function classifyScene(prompt: string): SceneType {
  const p = prompt.toLowerCase();
  if (/robot|android|mech|cyborg/.test(p)) return 'robot';
  if (/cat|kitten|feline/.test(p)) return 'cat';
  if (/castle|fortress|tower/.test(p)) return 'castle';
  if (/spaceship|rocket|ufo|spacecraft/.test(p)) return 'spaceship';
  if (/palm|ocean|beach|sea|island/.test(p)) return 'tree-ocean';
  if (/forest|woods|jungle/.test(p)) return 'forest';
  if (/city|skyline|building|skyscraper/.test(p)) return 'city';
  if (/moon|star|night/.test(p)) return 'moon-night';
  if (/mountain|peak|hill|summit/.test(p)) return 'mountain';
  if (/sunset|sunrise|dawn|dusk/.test(p)) return 'sunset-landscape';
  if (/tree|flower|garden|plant/.test(p)) return 'forest';
  if (/dog|puppy|wolf/.test(p)) return 'cat'; // reuse silhouette with variation
  return 'abstract';
}

// ─── Seeded RNG ─────────────────────────────────────────────────

function createRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ─── Rendering ──────────────────────────────────────────────────

type RNG = () => number;

function renderScene(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  scene: SceneType,
  rng: RNG
) {
  switch (scene) {
    case 'sunset-landscape': drawSunset(ctx, w, h, rng); break;
    case 'mountain': drawMountain(ctx, w, h, rng); break;
    case 'moon-night': drawMoonNight(ctx, w, h, rng); break;
    case 'robot': drawRobot(ctx, w, h, rng); break;
    case 'cat': drawCat(ctx, w, h, rng); break;
    case 'castle': drawCastle(ctx, w, h, rng); break;
    case 'spaceship': drawSpaceship(ctx, w, h, rng); break;
    case 'tree-ocean': drawTreeOcean(ctx, w, h, rng); break;
    case 'forest': drawForest(ctx, w, h, rng); break;
    case 'city': drawCity(ctx, w, h, rng); break;
    case 'abstract': drawAbstract(ctx, w, h, rng); break;
  }
}

// ─── Helper Drawing Functions ───────────────────────────────────

function fillGradient(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  colors: string[],
  stops?: number[]
) {
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  colors.forEach((c, i) => {
    const stop = stops ? stops[i] : i / (colors.length - 1);
    grad.addColorStop(stop, c);
  });
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
}

function drawStars(ctx: CanvasRenderingContext2D, w: number, h: number, rng: RNG, count: number) {
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < count; i++) {
    const x = rng() * w;
    const y = rng() * h * 0.6;
    const r = rng() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCircle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawMountainShape(
  ctx: CanvasRenderingContext2D,
  peakX: number,
  peakY: number,
  baseY: number,
  spread: number,
  color: string
) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(peakX - spread, baseY);
  ctx.lineTo(peakX, peakY);
  ctx.lineTo(peakX + spread, baseY);
  ctx.closePath();
  ctx.fill();
}

// ─── Scene Renderers ────────────────────────────────────────────

function drawSunset(ctx: CanvasRenderingContext2D, w: number, h: number, rng: RNG) {
  fillGradient(ctx, w, h, ['#1a0533', '#6b2fa0', '#d4567a', '#f4a742', '#f7d794']);

  // Sun
  const sunY = h * 0.45 + rng() * h * 0.05;
  drawCircle(ctx, w * 0.5, sunY, w * 0.08, '#ffe066');

  // Sun glow
  const glow = ctx.createRadialGradient(w * 0.5, sunY, w * 0.04, w * 0.5, sunY, w * 0.2);
  glow.addColorStop(0, 'rgba(255,224,102,0.4)');
  glow.addColorStop(1, 'rgba(255,224,102,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Horizon
  ctx.fillStyle = '#2d1b4e';
  ctx.fillRect(0, h * 0.7, w, h * 0.3);

  // Terrain silhouette
  ctx.fillStyle = '#1a0533';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.72);
  for (let x = 0; x <= w; x += 4) {
    const y = h * 0.72 + Math.sin(x * 0.02 + rng() * 0.5) * h * 0.03;
    ctx.lineTo(x, y);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Water reflection
  for (let i = 0; i < 20; i++) {
    const rx = rng() * w;
    const ry = h * 0.75 + rng() * h * 0.2;
    const rw = rng() * w * 0.15 + 10;
    ctx.fillStyle = `rgba(244,167,66,${rng() * 0.3})`;
    ctx.fillRect(rx, ry, rw, 1.5);
  }
}

function drawMountain(ctx: CanvasRenderingContext2D, w: number, h: number, rng: RNG) {
  fillGradient(ctx, w, h, ['#0f0c29', '#302b63', '#24243e']);

  drawStars(ctx, w, h, rng, 80);

  // Mountains
  drawMountainShape(ctx, w * 0.5, h * 0.2, h, w * 0.45, '#1a1a3e');
  drawMountainShape(ctx, w * 0.3, h * 0.35, h, w * 0.3, '#15153a');
  drawMountainShape(ctx, w * 0.75, h * 0.3, h, w * 0.35, '#121238');

  // Snow caps
  ctx.fillStyle = '#c8d6e5';
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.2);
  ctx.lineTo(w * 0.47, h * 0.27);
  ctx.lineTo(w * 0.53, h * 0.27);
  ctx.closePath();
  ctx.fill();

  // Foreground
  ctx.fillStyle = '#0d0d2b';
  ctx.fillRect(0, h * 0.85, w, h * 0.15);
}

function drawMoonNight(ctx: CanvasRenderingContext2D, w: number, h: number, rng: RNG) {
  fillGradient(ctx, w, h, ['#0a0a2e', '#1a1a4e', '#0f0f3a']);

  drawStars(ctx, w, h, rng, 150);

  // Moon
  const mx = w * 0.65;
  const my = h * 0.25;
  const mr = w * 0.07;
  drawCircle(ctx, mx, my, mr, '#e8e8d0');

  // Moon glow
  const glow = ctx.createRadialGradient(mx, my, mr * 0.5, mx, my, mr * 3);
  glow.addColorStop(0, 'rgba(232,232,208,0.2)');
  glow.addColorStop(1, 'rgba(232,232,208,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  // Craters
  drawCircle(ctx, mx - mr * 0.3, my - mr * 0.2, mr * 0.12, '#d0d0b8');
  drawCircle(ctx, mx + mr * 0.2, my + mr * 0.3, mr * 0.08, '#d0d0b8');

  // Ground/hills
  ctx.fillStyle = '#0d0d25';
  ctx.beginPath();
  ctx.moveTo(0, h * 0.8);
  for (let x = 0; x <= w; x += 3) {
    ctx.lineTo(x, h * 0.8 + Math.sin(x * 0.015) * h * 0.04 - rng() * 3);
  }
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Some trees silhouette
  for (let i = 0; i < 12; i++) {
    const tx = rng() * w;
    const ty = h * 0.78 + Math.sin(tx * 0.015) * h * 0.04;
    const th = rng() * h * 0.08 + h * 0.04;
    ctx.fillStyle = '#080820';
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - th * 0.2, ty);
    ctx.lineTo(tx, ty - th);
    ctx.lineTo(tx + th * 0.2, ty);
    ctx.closePath();
    ctx.fill();
  }
}

function drawRobot(ctx: CanvasRenderingContext2D, w: number, h: number, rng: RNG) {
  fillGradient(ctx, w, h, ['#1a1a2e', '#16213e']);

  // Grid lines background
  ctx.strokeStyle = 'rgba(0,255,150,0.05)';
  ctx.lineWidth = 1;
  for (let x = 0; x < w; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
  for (let y = 0; y < h; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }

  const cx = w / 2;
  const cy = h / 2;
  const headW = w * 0.35;
  const headH = h * 0.35;

  // Head
  ctx.fillStyle = '#2d3436';
  ctx.strokeStyle = '#00ff96';
  ctx.lineWidth = 3;
  const headX = cx - headW / 2;
  const headY = cy - headH / 2 - h * 0.05;
  roundRect(ctx, headX, headY, headW, headH, 15);

  // Antenna
  ctx.strokeStyle = '#636e72';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, headY);
  ctx.lineTo(cx, headY - h * 0.1);
  ctx.stroke();
  drawCircle(ctx, cx, headY - h * 0.1, 5, '#00ff96');

  // Eyes
  const eyeW = headW * 0.2;
  const eyeH = headH * 0.2;
  const eyeY = headY + headH * 0.3;

  // Left eye
  ctx.fillStyle = '#00ff96';
  ctx.shadowColor = '#00ff96';
  ctx.shadowBlur = 15;
  ctx.fillRect(cx - headW * 0.28, eyeY, eyeW, eyeH);

  // Right eye
  ctx.fillRect(cx + headW * 0.08, eyeY, eyeW, eyeH);
  ctx.shadowBlur = 0;

  // Mouth
  ctx.fillStyle = '#00ff96';
  ctx.shadowColor = '#00ff96';
  ctx.shadowBlur = 8;
  const mouthY = headY + headH * 0.7;
  for (let i = 0; i < 5; i++) {
    ctx.fillRect(cx - headW * 0.25 + i * headW * 0.12, mouthY, headW * 0.08, headH * 0.06);
  }
  ctx.shadowBlur = 0;

  // Ears / side panels
  ctx.fillStyle = '#2d3436';
  ctx.strokeStyle = '#00ff96';
  ctx.lineWidth = 2;
  ctx.strokeRect(headX - 12, eyeY - 5, 10, eyeH + 10);
  ctx.strokeRect(headX + headW + 2, eyeY - 5, 10, eyeH + 10);

  // Body hint
  ctx.fillStyle = '#2d3436';
  ctx.fillRect(cx - headW * 0.3, headY + headH + 5, headW * 0.6, h * 0.15);
  ctx.strokeStyle = '#00ff96';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - headW * 0.3, headY + headH + 5, headW * 0.6, h * 0.15);

  void rng; // seed consumed by caller
}

function drawCat(ctx: CanvasRenderingContext2D, w: number, h: number, rng: RNG) {
  fillGradient(ctx, w, h, ['#0a0a2e', '#1a1a4e', '#0f0f3a']);

  drawStars(ctx, w, h, rng, 60);

  // Moon
  drawCircle(ctx, w * 0.75, h * 0.2, w * 0.05, '#e8e8d0');

  const cx = w / 2;
  const baseY = h * 0.85;

  // Cat body silhouette
  ctx.fillStyle = '#0a0a1a';
  ctx.beginPath();
  // Body
  ctx.ellipse(cx, baseY - h * 0.12, w * 0.12, h * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  // Head
  ctx.beginPath();
  ctx.arc(cx, baseY - h * 0.3, w * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Ears
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.06, baseY - h * 0.34);
  ctx.lineTo(cx - w * 0.09, baseY - h * 0.46);
  ctx.lineTo(cx - w * 0.02, baseY - h * 0.36);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + w * 0.06, baseY - h * 0.34);
  ctx.lineTo(cx + w * 0.09, baseY - h * 0.46);
  ctx.lineTo(cx + w * 0.02, baseY - h * 0.36);
  ctx.closePath();
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#ffe066';
  drawCircle(ctx, cx - w * 0.03, baseY - h * 0.31, w * 0.015, '#ffe066');
  drawCircle(ctx, cx + w * 0.03, baseY - h * 0.31, w * 0.015, '#ffe066');

  // Pupils
  ctx.fillStyle = '#0a0a1a';
  drawCircle(ctx, cx - w * 0.03, baseY - h * 0.31, w * 0.005, '#0a0a1a');
  drawCircle(ctx, cx + w * 0.03, baseY - h * 0.31, w * 0.005, '#0a0a1a');

  // Tail
  ctx.strokeStyle = '#0a0a1a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.1, baseY - h * 0.05);
  ctx.quadraticCurveTo(cx + w * 0.22, baseY - h * 0.2, cx + w * 0.18, baseY - h * 0.3);
  ctx.stroke();

  // Ground
  ctx.fillStyle = '#0d0d25';
  ctx.fillRect(0, baseY, w, h - baseY);
}

function drawCastle(ctx: CanvasRenderingContext2D, w: number, h: number, rng: RNG) {
  fillGradient(ctx, w, h, ['#1a0533', '#2d1b4e', '#4a2a6e']);

  drawStars(ctx, w, h, rng, 50);

  const cx = w / 2;
  const baseY = h * 0.85;

  // Hill
  ctx.fillStyle = '#1a1a3e';
  ctx.beginPath();
  ctx.moveTo(0, baseY);
  ctx.quadraticCurveTo(cx, baseY - h * 0.15, w, baseY);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Castle body
  const castleW = w * 0.3;
  const castleH = h * 0.35;
  const castleX = cx - castleW / 2;
  const castleY = baseY - castleH - h * 0.07;
  ctx.fillStyle = '#2d2d5e';
  ctx.fillRect(castleX, castleY, castleW, castleH);

  // Towers
  const towerW = castleW * 0.2;
  const towerH = castleH * 0.4;
  ctx.fillStyle = '#252555';
  ctx.fillRect(castleX - towerW * 0.3, castleY - towerH, towerW, castleH + towerH);
  ctx.fillRect(castleX + castleW - towerW * 0.7, castleY - towerH, towerW, castleH + towerH);

  // Battlements
  const bw = towerW * 0.4;
  for (let i = 0; i < 3; i++) {
    ctx.fillRect(castleX - towerW * 0.3 + i * bw, castleY - towerH - bw, bw * 0.6, bw);
    ctx.fillRect(castleX + castleW - towerW * 0.7 + i * bw, castleY - towerH - bw, bw * 0.6, bw);
  }

  // Center battlements
  for (let i = 0; i < 7; i++) {
    ctx.fillRect(castleX + i * (castleW / 7), castleY - bw, castleW / 7 * 0.6, bw);
  }

  // Gate
  ctx.fillStyle = '#1a0533';
  ctx.beginPath();
  ctx.arc(cx, castleY + castleH - h * 0.08, w * 0.04, Math.PI, 0);
  ctx.fillRect(cx - w * 0.04, castleY + castleH - h * 0.08, w * 0.08, h * 0.08);
  ctx.fill();

  // Windows
  ctx.fillStyle = '#ffe066';
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 2; j++) {
      const wx = castleX + castleW * 0.2 + i * castleW * 0.25;
      const wy = castleY + castleH * 0.2 + j * castleH * 0.3;
      ctx.fillRect(wx, wy, castleW * 0.06, castleH * 0.08);
    }
  }

  // Foreground
  ctx.fillStyle = '#0d0d25';
  ctx.fillRect(0, baseY + h * 0.02, w, h * 0.15);
}

function drawSpaceship(ctx: CanvasRenderingContext2D, w: number, h: number, rng: RNG) {
  fillGradient(ctx, w, h, ['#000011', '#0a0a2e']);

  drawStars(ctx, w, h, rng, 200);

  // Planet in background
  const px = w * 0.2 + rng() * w * 0.1;
  const py = h * 0.7;
  const pr = w * 0.15;
  ctx.fillStyle = '#1a3a5c';
  ctx.beginPath();
  ctx.arc(px, py, pr, 0, Math.PI * 2);
  ctx.fill();

  // Planet ring
  ctx.strokeStyle = 'rgba(100,150,200,0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(px, py, pr * 1.5, pr * 0.3, -0.2, 0, Math.PI * 2);
  ctx.stroke();

  const cx = w * 0.6;
  const cy = h * 0.4;

  // Ship body
  ctx.fillStyle = '#4a4a6a';
  ctx.beginPath();
  ctx.moveTo(cx + w * 0.15, cy);
  ctx.quadraticCurveTo(cx + w * 0.05, cy - h * 0.06, cx - w * 0.1, cy - h * 0.02);
  ctx.quadraticCurveTo(cx - w * 0.12, cy, cx - w * 0.1, cy + h * 0.02);
  ctx.quadraticCurveTo(cx + w * 0.05, cy + h * 0.06, cx + w * 0.15, cy);
  ctx.fill();

  // Cockpit
  ctx.fillStyle = '#66ccff';
  ctx.beginPath();
  ctx.arc(cx + w * 0.08, cy, w * 0.02, 0, Math.PI * 2);
  ctx.fill();

  // Engines
  ctx.fillStyle = '#ff6633';
  ctx.beginPath();
  ctx.moveTo(cx - w * 0.1, cy - h * 0.015);
  ctx.lineTo(cx - w * 0.18, cy);
  ctx.lineTo(cx - w * 0.1, cy + h * 0.015);
  ctx.closePath();
  ctx.fill();

  // Engine glow
  const eg = ctx.createRadialGradient(cx - w * 0.14, cy, 2, cx - w * 0.14, cy, w * 0.06);
  eg.addColorStop(0, 'rgba(255,102,51,0.5)');
  eg.addColorStop(1, 'rgba(255,102,51,0)');
  ctx.fillStyle = eg;
  ctx.fillRect(cx - w * 0.2, cy - h * 0.05, w * 0.1, h * 0.1);

  // Wing details
  ctx.strokeStyle = '#5a5a7a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - h * 0.04);
  ctx.lineTo(cx - w * 0.02, cy - h * 0.1);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy + h * 0.04);
  ctx.lineTo(cx - w * 0.02, cy + h * 0.1);
  ctx.stroke();
}

function drawTreeOcean(ctx: CanvasRenderingContext2D, w: number, h: number, rng: RNG) {
  // Sky
  fillGradient(ctx, w, h, ['#87ceeb', '#e0f0ff', '#ffd700', '#ff8c00'], [0, 0.4, 0.6, 1]);

  // Sun
  drawCircle(ctx, w * 0.7, h * 0.35, w * 0.06, '#fff5b3');

  // Ocean
  const oceanY = h * 0.6;
  const oceanGrad = ctx.createLinearGradient(0, oceanY, 0, h);
  oceanGrad.addColorStop(0, '#1e90ff');
  oceanGrad.addColorStop(0.5, '#1a75d1');
  oceanGrad.addColorStop(1, '#0a5299');
  ctx.fillStyle = oceanGrad;
  ctx.fillRect(0, oceanY, w, h);

  // Ocean waves
  for (let i = 0; i < 15; i++) {
    const wy = oceanY + rng() * (h - oceanY);
    ctx.strokeStyle = `rgba(255,255,255,${0.1 + rng() * 0.15})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    const wx = rng() * w;
    ctx.moveTo(wx, wy);
    ctx.quadraticCurveTo(wx + w * 0.05, wy - 3, wx + w * 0.1, wy);
    ctx.stroke();
  }

  // Beach
  ctx.fillStyle = '#f4d98c';
  ctx.beginPath();
  ctx.moveTo(0, oceanY + 5);
  ctx.quadraticCurveTo(w * 0.3, oceanY - h * 0.05, w * 0.5, oceanY + 10);
  ctx.lineTo(0, h);
  ctx.lineTo(0, oceanY + 5);
  ctx.closePath();
  ctx.fill();

  // Palm tree trunk
  const treeX = w * 0.25;
  const treeBase = oceanY - h * 0.02;
  ctx.strokeStyle = '#8B6914';
  ctx.lineWidth = w * 0.02;
  ctx.beginPath();
  ctx.moveTo(treeX, treeBase);
  ctx.quadraticCurveTo(treeX - w * 0.02, treeBase - h * 0.25, treeX + w * 0.03, treeBase - h * 0.4);
  ctx.stroke();

  // Palm leaves
  const leafTop = treeBase - h * 0.4;
  const leafX = treeX + w * 0.03;
  ctx.strokeStyle = '#228B22';
  ctx.lineWidth = 3;
  for (let i = 0; i < 7; i++) {
    const angle = (i / 7) * Math.PI * 2;
    const lx = leafX + Math.cos(angle) * w * 0.1;
    const ly = leafTop + Math.sin(angle) * h * 0.08 - h * 0.02;
    ctx.beginPath();
    ctx.moveTo(leafX, leafTop);
    ctx.quadraticCurveTo(
      leafX + Math.cos(angle) * w * 0.06,
      leafTop + Math.sin(angle) * h * 0.04 - h * 0.03,
      lx,
      ly
    );
    ctx.stroke();
  }

  // Coconuts
  drawCircle(ctx, leafX - 3, leafTop + 3, 3, '#8B4513');
  drawCircle(ctx, leafX + 4, leafTop + 5, 3, '#8B4513');
}

function drawForest(ctx: CanvasRenderingContext2D, w: number, h: number, rng: RNG) {
  fillGradient(ctx, w, h, ['#1a3a2a', '#0d2818', '#0a1f12']);

  // Mist
  for (let i = 0; i < 8; i++) {
    const my = h * 0.3 + rng() * h * 0.4;
    const mg = ctx.createRadialGradient(rng() * w, my, 10, rng() * w, my, w * 0.3);
    mg.addColorStop(0, 'rgba(200,220,200,0.08)');
    mg.addColorStop(1, 'rgba(200,220,200,0)');
    ctx.fillStyle = mg;
    ctx.fillRect(0, 0, w, h);
  }

  // Background trees
  for (let layer = 0; layer < 3; layer++) {
    const alpha = 0.3 + layer * 0.25;
    const baseY = h * 0.5 + layer * h * 0.15;
    const treeCount = 8 + layer * 4;

    for (let i = 0; i < treeCount; i++) {
      const tx = rng() * w;
      const th = h * (0.2 + rng() * 0.2) * (1 + layer * 0.3);
      const tw = th * 0.25;

      // Trunk
      ctx.fillStyle = `rgba(60,40,20,${alpha})`;
      ctx.fillRect(tx - tw * 0.1, baseY - th * 0.3, tw * 0.2, th * 0.3);

      // Canopy
      ctx.fillStyle = `rgba(${20 + layer * 15},${60 + layer * 20},${20 + layer * 10},${alpha})`;
      ctx.beginPath();
      ctx.moveTo(tx, baseY - th);
      ctx.lineTo(tx - tw, baseY - th * 0.3);
      ctx.lineTo(tx + tw, baseY - th * 0.3);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(tx, baseY - th * 0.8);
      ctx.lineTo(tx - tw * 1.2, baseY - th * 0.1);
      ctx.lineTo(tx + tw * 1.2, baseY - th * 0.1);
      ctx.closePath();
      ctx.fill();
    }
  }

  // Ground
  ctx.fillStyle = '#0a1f12';
  ctx.fillRect(0, h * 0.88, w, h * 0.12);
}

function drawCity(ctx: CanvasRenderingContext2D, w: number, h: number, rng: RNG) {
  fillGradient(ctx, w, h, ['#0a0a2e', '#1a1a4e', '#2a2a5e']);

  drawStars(ctx, w, h, rng, 40);

  const baseY = h * 0.85;

  // Buildings
  for (let i = 0; i < 15; i++) {
    const bw = w * (0.04 + rng() * 0.06);
    const bh = h * (0.15 + rng() * 0.35);
    const bx = rng() * (w - bw);
    const by = baseY - bh;

    const shade = 20 + Math.floor(rng() * 30);
    ctx.fillStyle = `rgb(${shade},${shade},${shade + 20})`;
    ctx.fillRect(bx, by, bw, bh);

    // Windows
    const wRows = Math.floor(bh / 12);
    const wCols = Math.floor(bw / 8);
    for (let r = 1; r < wRows; r++) {
      for (let c = 0; c < wCols; c++) {
        if (rng() > 0.4) {
          const lit = rng() > 0.3;
          ctx.fillStyle = lit ? '#ffe066' : '#333355';
          ctx.fillRect(bx + 3 + c * 8, by + r * 12, 4, 6);
        }
      }
    }
  }

  // Ground
  ctx.fillStyle = '#111';
  ctx.fillRect(0, baseY, w, h - baseY);

  // Street lights
  for (let i = 0; i < 5; i++) {
    const lx = w * 0.1 + i * w * 0.2;
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(lx, baseY);
    ctx.lineTo(lx, baseY - h * 0.06);
    ctx.stroke();
    drawCircle(ctx, lx, baseY - h * 0.06, 3, '#ffcc00');
  }
}

function drawAbstract(ctx: CanvasRenderingContext2D, w: number, h: number, rng: RNG) {
  // Dark base
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, w, h);

  // Flowing shapes
  for (let i = 0; i < 12; i++) {
    const hue = Math.floor(rng() * 360);
    const cx = rng() * w;
    const cy = rng() * h;
    const r = w * (0.05 + rng() * 0.2);

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    grad.addColorStop(0, `hsla(${hue},70%,50%,0.6)`);
    grad.addColorStop(0.5, `hsla(${hue},70%,40%,0.3)`);
    grad.addColorStop(1, `hsla(${hue},70%,30%,0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Geometric lines
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.moveTo(rng() * w, rng() * h);
    ctx.lineTo(rng() * w, rng() * h);
    ctx.stroke();
  }

  // Central focal shape
  const cx2 = w / 2;
  const cy2 = h / 2;
  const hue = Math.floor(rng() * 360);
  ctx.strokeStyle = `hsla(${hue},80%,60%,0.8)`;
  ctx.lineWidth = 2;
  ctx.beginPath();
  for (let a = 0; a < Math.PI * 2; a += 0.05) {
    const r = w * 0.1 + Math.sin(a * 3 + rng()) * w * 0.05;
    const x = cx2 + Math.cos(a) * r;
    const y = cy2 + Math.sin(a) * r;
    if (a === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();
}

// ─── Utility ────────────────────────────────────────────────────

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}
