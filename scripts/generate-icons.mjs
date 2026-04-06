import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = resolve(__dirname, '../public/icons/icon.svg');
const svgBuffer = readFileSync(svgPath);

const sizes = [32, 180, 192, 512];

for (const size of sizes) {
  const outName = size === 32 ? 'favicon.png' : `icon-${size}.png`;
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(resolve(__dirname, `../public/icons/${outName}`));
  console.log(`Generated ${outName}`);
}

// Also generate favicon.ico from 32px
await sharp(svgBuffer)
  .resize(32, 32)
  .png()
  .toFile(resolve(__dirname, '../public/favicon.png'));
console.log('Generated favicon.png');
console.log('Done!');
