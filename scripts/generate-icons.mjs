import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ASSETS = path.join(__dirname, '..', 'assets');

const BG_DARK = '#0A0807';
const BG_CREAM = '#F2EAD8';
const INK = '#1F1A14';
const AMBER_START = '#FFB870';
const AMBER_END = '#FFCB8A';

function glowSvg({ size, ratio, withBg }) {
  const cx = size / 2;
  const r = size * ratio;
  const haloR = r * 1.6;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="halo" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${AMBER_START}" stop-opacity="0.6"/>
      <stop offset="60%" stop-color="${AMBER_START}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${AMBER_START}" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${AMBER_END}" stop-opacity="1"/>
      <stop offset="55%" stop-color="${AMBER_END}" stop-opacity="0.85"/>
      <stop offset="100%" stop-color="${AMBER_START}" stop-opacity="0.05"/>
    </radialGradient>
  </defs>
  ${withBg ? `<rect width="${size}" height="${size}" fill="${BG_DARK}"/>` : ''}
  <circle cx="${cx}" cy="${cx}" r="${haloR}" fill="url(#halo)"/>
  <circle cx="${cx}" cy="${cx}" r="${r}" fill="url(#core)"/>
</svg>`;
}

function wordmarkSvg({ size, withBg }) {
  const k = size / 1024;
  const sw = 22 * k;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 1024 1024">
  ${withBg ? `<rect width="1024" height="1024" fill="${BG_CREAM}"/>` : ''}
  <g stroke="${INK}" stroke-width="${sw / k}" stroke-linecap="round" stroke-linejoin="round" fill="none">
    <!-- D -->
    <path d="M 222 215 L 224 818"/>
    <path d="M 198 215 L 252 215"/>
    <path d="M 196 818 L 256 818"/>
    <path d="M 224 215 Q 410 232 416 516 Q 410 802 224 818"/>

    <!-- i (capital I, dot omitted to match sketch) -->
    <path d="M 510 295 L 512 818"/>
    <path d="M 486 295 L 538 295"/>
    <path d="M 486 818 L 540 818"/>

    <!-- m -->
    <path d="M 620 295 L 622 818"/>
    <path d="M 700 295 L 702 818"/>
    <path d="M 780 295 L 782 818"/>
    <path d="M 620 295 Q 660 260 700 295"/>
    <path d="M 700 295 Q 740 260 780 295"/>
    <path d="M 600 818 L 642 818"/>
    <path d="M 760 818 L 802 818"/>
  </g>
</svg>`;
}

async function emit(name, svg) {
  const out = path.join(ASSETS, name);
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(out);
  console.log('wrote', name);
}

await mkdir(ASSETS, { recursive: true });

await emit('icon.png', wordmarkSvg({ size: 1024, withBg: true }));
await emit(
  'adaptive-icon.png',
  wordmarkSvg({ size: 1024, withBg: false }),
);
await emit('favicon.png', wordmarkSvg({ size: 64, withBg: true }));
await emit(
  'splash-icon.png',
  glowSvg({ size: 1024, ratio: 0.18, withBg: true }),
);

console.log('done');
