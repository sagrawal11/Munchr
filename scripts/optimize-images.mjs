// One-off (re-runnable) image optimizer for public/images. Resizes to ~2x display size
// and re-encodes; only writes when the result is smaller, so it's safe to re-run after
// dropping new product/building art. Run: node scripts/optimize-images.mjs
import sharp from 'sharp';
import { readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, extname } from 'node:path';

const targets = [
  { dir: 'public/images/products', max: 160 },
  { dir: 'public/images/buildings', max: 400 },
];
const exts = new Set(['.webp', '.avif', '.png', '.jpg', '.jpeg']);

let savedBytes = 0;
let count = 0;
for (const { dir, max } of targets) {
  for (const f of readdirSync(dir)) {
    const ext = extname(f).toLowerCase();
    if (!exts.has(ext)) continue;
    const p = join(dir, f);
    const before = statSync(p).size;
    try {
      const img = sharp(p, { animated: false }).resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true });
      let out;
      if (ext === '.webp') out = await img.webp({ quality: 78 }).toBuffer();
      else if (ext === '.avif') out = await img.avif({ quality: 55 }).toBuffer();
      else if (ext === '.png') out = await img.png({ compressionLevel: 9, palette: true }).toBuffer();
      else out = await img.jpeg({ quality: 78, mozjpeg: true }).toBuffer();
      if (out.length < before) { writeFileSync(p, out); savedBytes += before - out.length; count++; }
    } catch (e) {
      console.error('skip', f, '—', e.message);
    }
  }
}
console.log(`optimized ${count} images, saved ${(savedBytes / 1024 / 1024).toFixed(2)} MB`);
