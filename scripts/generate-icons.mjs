import sharp from 'sharp';
import opentypeNs from 'opentype.js';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const opentype = opentypeNs.default ?? opentypeNs;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const ASSETS = path.join(ROOT, 'assets');
const FONT_PATH = path.join(
  ROOT,
  'node_modules/@expo-google-fonts/lora/700Bold/Lora_700Bold.ttf',
);

const BG_DARK = '#0A0807';
const TEXT_CREAM = '#D4C4B0';
const AMBER_START = '#FFB870';
const AMBER_END = '#FFCB8A';

const fontBuffer = await readFile(FONT_PATH);
const font = opentype.parse(
  fontBuffer.buffer.slice(
    fontBuffer.byteOffset,
    fontBuffer.byteOffset + fontBuffer.byteLength,
  ),
);

const unitScale = (fontSize) => fontSize / font.unitsPerEm;

function buildLetters(text, x, y, fontSize) {
  const scale = unitScale(fontSize);
  let cursor = x;
  const letters = [];
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    const glyphPath = glyph.getPath(cursor, y, fontSize);
    const bbox = glyphPath.getBoundingBox();
    letters.push({ char, path: glyphPath, bbox, x: cursor });
    cursor += glyph.advanceWidth * scale;
  }
  return { letters, totalWidth: cursor - x };
}

function wordmarkSvg({ size, withBg }) {
  const fontSize = size * 0.43;

  const probe = buildLetters('DIM', 0, 0, fontSize);
  let minY = Infinity;
  let maxY = -Infinity;
  let minX = Infinity;
  let maxX = -Infinity;
  for (const l of probe.letters) {
    if (l.bbox.y1 < minY) minY = l.bbox.y1;
    if (l.bbox.y2 > maxY) maxY = l.bbox.y2;
    if (l.bbox.x1 < minX) minX = l.bbox.x1;
    if (l.bbox.x2 > maxX) maxX = l.bbox.x2;
  }
  const visualWidth = maxX - minX;
  const visualHeight = maxY - minY;

  const startX = (size - visualWidth) / 2 - minX;
  const baselineY = (size - visualHeight) / 2 - minY;

  const { letters } = buildLetters('DIM', startX, baselineY, fontSize);
  const allPathD = letters.map((l) => l.path.toPathData(2)).join(' ');

  const dGlyph = letters[0];
  const dBox = dGlyph.bbox;
  const dCounterCx = (dBox.x1 + dBox.x2) / 2 + (dBox.x2 - dBox.x1) * 0.06;
  const dCounterCy = (dBox.y1 + dBox.y2) / 2;
  const dotR = visualHeight * 0.085;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <radialGradient id="amber" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${AMBER_END}" stop-opacity="1"/>
      <stop offset="40%" stop-color="${AMBER_START}" stop-opacity="1"/>
      <stop offset="80%" stop-color="${AMBER_START}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${AMBER_START}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  ${withBg ? `<rect width="${size}" height="${size}" fill="${BG_DARK}"/>` : ''}
  <path d="${allPathD}" fill="${TEXT_CREAM}"/>
  <circle cx="${dCounterCx}" cy="${dCounterCy}" r="${dotR * 2.4}" fill="url(#amber)" opacity="0.55"/>
  <circle cx="${dCounterCx}" cy="${dCounterCy}" r="${dotR}" fill="url(#amber)"/>
</svg>`;
}

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
