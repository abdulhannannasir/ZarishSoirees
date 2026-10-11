/**
 * Generates labelled placeholder photos for every section in
 * src/components/sites/wedding-wonderland/content.ts, so the site renders before the real
 * photography arrives. Each placeholder shows its own filename, the recommended export size,
 * the "keep the subject inside" safe zone, and where the text overlay will sit.
 *
 *   npm run placeholders
 *
 * It overwrites files at the paths named in content.ts, so run it before dropping in real
 * photos, or point `src` somewhere else first. It never touches paths outside /public.
 * (Node 24 runs the .ts import below natively.)
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { SECTIONS } from "../src/components/sites/wedding-wonderland/content.ts";

const PUBLIC_DIR = path.resolve("public");

/** Placeholders are rendered smaller than the recommended export size to keep the repo light. */
const FORMATS = {
  desktop: { w: 1920, h: 1080, note: "16:9 landscape · export at least 2880 × 1620 px", copyZone: [0.05, 0.5, 0.4, 0.34] },
  mobile: { w: 900, h: 1500, note: "3:5 portrait · export at least 1200 × 2000 px", copyZone: [0.05, 0.56, 0.9, 0.28] },
};

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A loud, colourful field built from the section's own palette, in the spirit of the brand. */
function field(w, h, colors) {
  const [a, b, c, d] = colors;
  return `
    <rect width="${w}" height="${h}" fill="${a}"/>
    <rect width="${w}" height="${h}" fill="url(#g1)"/>
    <circle cx="${w * 0.18}" cy="${h * 0.3}" r="${h * 0.38}" fill="${b}" opacity="0.8"/>
    <circle cx="${w * 0.82}" cy="${h * 0.22}" r="${h * 0.3}" fill="${c}" opacity="0.8"/>
    <circle cx="${w * 0.62}" cy="${h * 0.82}" r="${h * 0.42}" fill="${d}" opacity="0.75"/>
    <circle cx="${w * 0.3}" cy="${h * 0.9}" r="${h * 0.22}" fill="${b}" opacity="0.7"/>
    <rect width="${w}" height="${h}" fill="url(#g2)"/>`;
}

function svg({ w, h, note, copyZone }, section, file, kind) {
  const u = w / 1920; // scale text with the canvas
  const colors = [0, 1, 2, 3].map((i) => section.swatches[i % section.swatches.length].value);
  const [zx, zy, zw, zh] = copyZone.map((v, i) => v * (i % 2 ? h : w));
  const safeX = kind === "mobile" ? 0 : w * 0.2;
  const safeW = kind === "mobile" ? w : w * 0.6;
  const cx = w / 2;
  const f = (n) => Math.round(n * u * (kind === "mobile" ? 1.6 : 1));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <radialGradient id="g1" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0.15"/></radialGradient>
    <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient>
  </defs>
  ${field(w, h, colors)}
  <!-- safe zone: keep the subject inside -->
  <rect x="${safeX + 6}" y="${h * 0.1}" width="${safeW - 12}" height="${h * 0.8}" fill="none" stroke="#fff" stroke-width="${f(3)}" stroke-dasharray="${f(18)} ${f(12)}" opacity="0.85"/>
  <text x="${safeX + f(22)}" y="${h * 0.1 + f(34)}" font-family="Helvetica, Arial, sans-serif" font-size="${f(22)}" fill="#fff" opacity="0.95">KEEP THE SUBJECT INSIDE THIS BOX</text>
  <!-- text overlay zone -->
  <rect x="${zx}" y="${zy}" width="${zw}" height="${zh}" fill="#000" fill-opacity="0.28" stroke="#ffe08a" stroke-width="${f(3)}" stroke-dasharray="${f(10)} ${f(8)}"/>
  <text x="${zx + f(18)}" y="${zy + f(34)}" font-family="Helvetica, Arial, sans-serif" font-size="${f(21)}" fill="#ffe08a">TEXT SITS HERE: KEEP THIS CORNER CALM AND DARK</text>
  <!-- label -->
  <g transform="translate(${cx} ${h * 0.42})" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" fill="#fff">
    <rect x="${-w * (kind === "mobile" ? 0.44 : 0.3)}" y="${-f(150)}" width="${w * (kind === "mobile" ? 0.88 : 0.6)}" height="${f(330)}" rx="${f(18)}" fill="#000" fill-opacity="0.62"/>
    <text y="${-f(100)}" font-size="${f(26)}" letter-spacing="${f(6)}" fill="#ffe08a">PHOTO PLACEHOLDER</text>
    <text y="${-f(34)}" font-size="${f(kind === "mobile" ? 44 : 62)}" font-weight="700">${esc(section.title)}</text>
    <text y="${f(26)}" font-size="${f(30)}" font-family="Menlo, Consolas, monospace">${esc(file)}</text>
    <text y="${f(80)}" font-size="${f(26)}">${esc(note)}</text>
    <text y="${f(128)}" font-size="${f(22)}" opacity="0.85">${esc(section.photo.brief)}</text>
    <text y="${f(168)}" font-size="${f(20)}" opacity="0.7">Replace this file. No code change needed if the filename stays.</text>
  </g>
</svg>`;
}

async function render(section, srcPath, kind) {
  const format = FORMATS[kind];
  const out = path.join(PUBLIC_DIR, srcPath);
  // Refuse anything that would write outside /public, whatever content.ts says.
  if (!out.startsWith(PUBLIC_DIR + path.sep)) throw new Error(`Refusing to write outside /public: ${srcPath}`);
  await mkdir(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(svg(format, section, srcPath, kind)))
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out);
  console.log(`  ${srcPath}  (${format.w}x${format.h})`);
}

console.log(`Writing placeholders to ${PUBLIC_DIR}`);
for (const section of SECTIONS) {
  await render(section, section.photo.src, "desktop");
  if (section.photo.mobileSrc) await render(section, section.photo.mobileSrc, "mobile");
}
console.log("Done.");
