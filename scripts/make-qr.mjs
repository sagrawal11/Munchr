// Generate a print-ready QR code for the flyer. High error-correction ('H', ~30% damage
// tolerance) + a wide quiet zone so it scans reliably even if the flyer is scuffed.
//   node scripts/make-qr.mjs [url]   (default: the Munchr flyer URL with ?src=flyer)
import QRCode from 'qrcode';
import { mkdirSync, writeFileSync } from 'node:fs';

const url = process.argv[2] || 'https://www.munchr.app/?src=flyer';
const outDir = 'public/qr';
// Pure black on white: maximum contrast so it scans reliably in black-and-white print / photocopy.
const opts = { errorCorrectionLevel: 'H', margin: 4, color: { dark: '#000000ff', light: '#ffffffff' } };

mkdirSync(outDir, { recursive: true });
await QRCode.toFile(`${outDir}/munchr-flyer-qr.png`, url, { ...opts, width: 1400 }); // ~hi-res for print
const svg = await QRCode.toString(url, { ...opts, type: 'svg' });
writeFileSync(`${outDir}/munchr-flyer-qr.svg`, svg);

console.log(`QR generated for: ${url}`);
console.log(`  → ${outDir}/munchr-flyer-qr.png (1400px)`);
console.log(`  → ${outDir}/munchr-flyer-qr.svg (vector — scales to any flyer size)`);
