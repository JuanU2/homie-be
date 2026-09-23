#!/usr/bin/env node
// Sends property photos to the worker's /ai/analyze-property endpoint.
// Usage: node analyze-property-test.mjs [image-path ...]
//   (with no args, uses the default image list below)

import { readFileSync } from 'node:fs';
import { basename } from 'node:path';

const DEFAULT_IMAGES = [
  '/home/xmarcos/Stiahnuté/IMG_20250524_180822669.jpg',
  '/home/xmarcos/Stiahnuté/IMG_20250524_180213366.jpg',
  '/home/xmarcos/Stiahnuté/IMG_20250524_180438553.jpg',
  '/home/xmarcos/Stiahnuté/IMG_20250524_180604287.jpg',
  '/home/xmarcos/Stiahnuté/IMG_20250524_180117349.jpg',
  '/home/xmarcos/Stiahnuté/IMG_20250524_180255957.jpg',
  '/home/xmarcos/Stiahnuté/IMG_20250524_180339804.jpg',
];

const BASE_URL = process.env.WORKER_URL ?? 'http://localhost:3002';
const ENDPOINT = `${BASE_URL}/ai/analyze-property`;

const MIME_BY_EXT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
  '.heif': 'image/heif',
};

function mimeFor(path) {
  const ext = path.slice(path.lastIndexOf('.')).toLowerCase();
  return MIME_BY_EXT[ext] ?? 'image/jpeg';
}

const paths =
  process.argv.slice(2).length > 0 ? process.argv.slice(2) : DEFAULT_IMAGES;

const images = paths.map((path) => ({
  data: readFileSync(path, 'base64'),
  mimeType: mimeFor(path),
}));

const payloadBytes = images.reduce((sum, img) => sum + img.data.length, 0);
console.log(
  `Sending ${images.length} image(s), base64 payload ≈ ${(
    payloadBytes /
    1024 /
    1024
  ).toFixed(2)} MB`,
);
paths.forEach((p) => console.log(`  - ${basename(p)} (${mimeFor(p)})`));

const started = Date.now();
const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ images, language: 'sk' }),
});

const text = await res.text();
const elapsed = ((Date.now() - started) / 1000).toFixed(1);
console.log(`\nHTTP ${res.status} (${elapsed}s)`);

try {
  console.log(JSON.stringify(JSON.parse(text), null, 2));
} catch {
  console.log(text);
}
