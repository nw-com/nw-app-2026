const { PNG } = require('pngjs');
const fs = require('fs');
const path = require('path');

function makeStripeIcon(size) {
  const png = new PNG({ width: size, height: size });
  const w = size, h = size;
  const border = Math.max(4, Math.round(size * 0.02));
  const stripe = Math.round(h / 3);
  function setPixel(x, y, r, g, b, a = 255) {
    const idx = (w * y + x) << 2;
    png.data[idx] = r;
    png.data[idx + 1] = g;
    png.data[idx + 2] = b;
    png.data[idx + 3] = a;
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0;
      if (y < stripe) { r = 198; g = 40; b = 40; }       // red
      else if (y < stripe * 2) { r = 67; g = 160; b = 71; } // green
      else { r = 0; g = 0; b = 0; }                      // black
      setPixel(x, y, r, g, b);
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (x < border || y < border || x >= w - border || y >= h - border) {
        setPixel(x, y, 255, 255, 255);
      }
    }
  }
  return png;
}

function writeIcon(size, outPath) {
  const icon = makeStripeIcon(size);
  return new Promise((resolve, reject) => {
    const stream = fs.createWriteStream(outPath);
    icon.pack().pipe(stream);
    stream.on('finish', resolve);
    stream.on('error', reject);
  });
}

async function main() {
  const outDir = path.join(process.cwd(), 'icons');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  await writeIcon(192, path.join(outDir, '192.png'));
  await writeIcon(512, path.join(outDir, '512.png'));
  console.log('Generated icons at ./icons/192.png and ./icons/512.png');
}

main().catch(err => {
  console.error('Icon generation failed:', err);
  process.exit(1);
});

