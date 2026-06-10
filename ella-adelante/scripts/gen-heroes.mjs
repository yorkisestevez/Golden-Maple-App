// Generates editorial placeholder hero images for the seeded sample posts.
// Run once with `npm run seed:images` (also wired into postinstall-friendly
// docs). Uses sharp, already a project dependency. These are clearly
// abstract/editorial — not stock photos — and are meant to be replaced by
// real photography in the CMS.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', 'src', 'assets', 'heroes');
mkdirSync(outDir, { recursive: true });

const W = 1600;
const H = 1067;

// Palette-driven, per-pillar abstract compositions.
const heroes = [
  { name: 'historias-mariela', a: '#0F4C5C', b: '#1A1A2E', accent: '#C9A227', kicker: 'HISTORIAS' },
  { name: 'historias-colmado', a: '#15616D', b: '#0F4C5C', accent: '#E94560', kicker: 'HISTORIAS' },
  { name: 'dinero-presupuesto', a: '#1A1A2E', b: '#0F4C5C', accent: '#C9A227', kicker: 'DINERO' },
  { name: 'dinero-negocio', a: '#0F4C5C', b: '#15616D', accent: '#E94560', kicker: 'DINERO' },
  { name: 'voz-machismo', a: '#1A1A2E', b: '#2a2540', accent: '#E94560', kicker: 'VOZ' },
  { name: 'herramientas-plan', a: '#0F4C5C', b: '#1A1A2E', accent: '#C9A227', kicker: 'HERRAMIENTAS' },
];

function svg({ a, b, accent, kicker }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}"/>
      <stop offset="1" stop-color="${b}"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#g)"/>
  <g opacity="0.16" stroke="${accent}" stroke-width="2" fill="none">
    <circle cx="1230" cy="300" r="260"/>
    <circle cx="1230" cy="300" r="180"/>
    <circle cx="1230" cy="300" r="100"/>
  </g>
  <rect x="120" y="${H - 230}" width="70" height="10" fill="${accent}"/>
  <text x="120" y="${H - 170}" font-family="Georgia, serif" font-size="60" fill="#F7F3EE" font-weight="700" letter-spacing="2">Ella Adelante</text>
  <text x="123" y="${H - 110}" font-family="Helvetica, Arial, sans-serif" font-size="26" fill="${accent}" letter-spacing="8">${kicker}</text>
</svg>`;
}

for (const h of heroes) {
  const buf = Buffer.from(svg(h));
  await sharp(buf)
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(join(outDir, `${h.name}.jpg`));
  console.log('wrote', `${h.name}.jpg`);
}

console.log(`\n${heroes.length} hero images written to src/assets/heroes/`);
