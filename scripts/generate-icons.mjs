import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ASSETS = resolve(__dirname, '../artifacts/mobile/assets/images');

mkdirSync(ASSETS, { recursive: true });

const BRAND_GREEN = '#05503C';
const WHITE = '#FFFFFF';

function symbolSvg(bgColor, fgColor, size) {
  const s = size;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 100 100">
    ${bgColor ? `<rect width="100" height="100" rx="22" fill="${bgColor}"/>` : ''}

    <!-- C shape: rounded rect with rectangular cutout on right-middle -->
    <path d="
      M 8,10
      Q 8,8 10,8
      L 46,8
      Q 52,8 52,14
      L 52,32
      Q 52,38 46,38
      L 20,38
      L 20,62
      L 46,62
      Q 52,62 52,68
      L 52,86
      Q 52,92 46,92
      L 10,92
      Q 8,92 8,90
      Z
    " fill="${fgColor}"/>

    <!-- Three vertical bars (signal / chart) -->
    <rect x="60" y="52" width="10" height="32" rx="3" fill="${fgColor}"/>
    <rect x="75" y="36" width="10" height="48" rx="3" fill="${fgColor}"/>
    <rect x="90" y="44" width="10" height="40" rx="3" fill="${fgColor}"/>
  </svg>`;
}

async function makePng(svgStr, outPath, size) {
  await sharp(Buffer.from(svgStr))
    .resize(size, size)
    .png()
    .toFile(outPath);
  console.log(`✓ ${outPath}`);
}

async function main() {
  // 1. Main icon: green background + white symbol (1024x1024)
  await makePng(
    symbolSvg(BRAND_GREEN, WHITE, 1024),
    resolve(ASSETS, 'icon.png'),
    1024
  );

  // 2. Android adaptive icon foreground: transparent bg + white symbol
  //    Symbol should live inside safe zone ~72% of 1024 = 738px, centered.
  //    We'll generate a 1024x1024 with the symbol scaled/padded appropriately.
  const fgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 100 100">
    <!-- transparent background -->
    <!-- scale symbol to ~70% of canvas, centered -->
    <g transform="translate(15,15) scale(0.70)">
      ${symbolSvg(null, WHITE, 100).replace(/<svg[^>]*>|<\/svg>/g, '')}
    </g>
  </svg>`;

  await makePng(fgSvg, resolve(ASSETS, 'adaptive-icon.png'), 1024);

  // 3. Splash screen: same as icon (used by Expo)
  await makePng(
    symbolSvg(BRAND_GREEN, WHITE, 1024),
    resolve(ASSETS, 'splash-icon.png'),
    1024
  );

  console.log('\nAll icons generated successfully.');
}

main().catch(err => { console.error(err); process.exit(1); });
