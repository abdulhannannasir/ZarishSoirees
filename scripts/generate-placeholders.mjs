/**
 * Generates labelled placeholder photos for every photo named in
 * src/components/sites/wedding-wonderland/content.ts: the five showpiece sections and the
 * finale's founder portrait. They let the site render before the real photography arrives. Each
 * placeholder shows its own filename, the recommended export size, the "keep the subject inside"
 * safe zone, and where the text will sit.
 *
 *   npm run placeholders              creates only the placeholders that are missing
 *   npm run placeholders -- --force   overwrites existing files too (this destroys real photos)
 *
 * By default it never touches a file that already exists, so real photos dropped in under these
 * names are safe. It also never writes outside /public.
 * (Node 24 runs the .ts import below natively.)
 */
import { existsSync } from "node:fs";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { FINALE, SECTIONS } from "../src/components/sites/wedding-wonderland/content.ts";

const PUBLIC_DIR = path.resolve("public");
const FORCE = process.argv.includes("--force");

/** Placeholders are rendered smaller than the recommended export size to keep the repo light. */
const FORMATS = {
  desktop: { w: 1920, h: 1080, note: "16:9 landscape · export at least 2880 × 1620 px", copyZone: [0.05, 0.5, 0.4, 0.34] },
  mobile: { w: 900, h: 1500, note: "3:5 portrait · export at least 1200 × 2000 px", copyZone: [0.05, 0.56, 0.9, 0.28] },
  portrait: { w: 1200, h: 1500, note: "4:5 portrait · export at least 1600 × 2000 px" },
};

const FONT = "Helvetica, Arial, sans-serif";
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** A loud, colourful field built from the photo's own palette, in the spirit of the brand. */
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

const DEFS = `
  <defs>
    <radialGradient id="g1" cx="50%" cy="40%" r="75%"><stop offset="0" stop-color="#fff" stop-opacity="0.35"/><stop offset="1" stop-color="#000" stop-opacity="0.15"/></radialGradient>
    <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="0.35"/></linearGradient>
  </defs>`;

const paletteOf = (job) => [0, 1, 2, 3].map((i) => job.swatches[i % job.swatches.length].value);

/** Full-bleed placeholders: the 16:9 section background and the 3:5 phone crop. */
function svg(job) {
  const { kind } = job;
  const { w, h, note, copyZone } = FORMATS[kind];
  const u = w / 1920; // scale text with the canvas
  const [zx, zy, zw, zh] = (job.copyZone ?? copyZone).map((v, i) => v * (i % 2 ? h : w));
  const safeX = kind === "mobile" ? 0 : w * 0.2;
  const safeW = kind === "mobile" ? w : w * 0.6;
  const cx = w / 2;
  const f = (n) => Math.round(n * u * (kind === "mobile" ? 1.6 : 1));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${DEFS}
  ${field(w, h, paletteOf(job))}
  <!-- safe zone: keep the subject inside -->
  <rect x="${safeX + 6}" y="${h * 0.1}" width="${safeW - 12}" height="${h * 0.8}" fill="none" stroke="#fff" stroke-width="${f(3)}" stroke-dasharray="${f(18)} ${f(12)}" opacity="0.85"/>
  <text x="${safeX + f(22)}" y="${h * 0.1 + f(34)}" font-family="${FONT}" font-size="${f(22)}" fill="#fff" opacity="0.95">KEEP THE SUBJECT INSIDE THIS BOX</text>
  <!-- text overlay zone -->
  <rect x="${zx}" y="${zy}" width="${zw}" height="${zh}" fill="#000" fill-opacity="0.28" stroke="#ffe08a" stroke-width="${f(3)}" stroke-dasharray="${f(10)} ${f(8)}"/>
  <text x="${zx + f(18)}" y="${zy + f(34)}" font-family="${FONT}" font-size="${f(21)}" fill="#ffe08a">${esc(job.zoneLabel ?? "TEXT SITS HERE: KEEP THIS CORNER CALM AND DARK")}</text>
  <!-- label -->
  <g transform="translate(${cx} ${h * 0.42})" text-anchor="middle" font-family="${FONT}" fill="#fff">
    <rect x="${-w * (kind === "mobile" ? 0.44 : 0.3)}" y="${-f(150)}" width="${w * (kind === "mobile" ? 0.88 : 0.6)}" height="${f(330)}" rx="${f(18)}" fill="#000" fill-opacity="0.62"/>
    <text y="${-f(100)}" font-size="${f(26)}" letter-spacing="${f(6)}" fill="#ffe08a">PHOTO PLACEHOLDER</text>
    <text y="${-f(34)}" font-size="${f(kind === "mobile" ? 44 : 62)}" font-weight="700">${esc(job.title)}</text>
    <text y="${f(26)}" font-size="${f(30)}" font-family="Menlo, Consolas, monospace">${esc(job.file)}</text>
    <text y="${f(80)}" font-size="${f(26)}">${esc(note)}</text>
    <text y="${f(128)}" font-size="${f(22)}" opacity="0.85">${esc(job.brief)}</text>
    <text y="${f(168)}" font-size="${f(20)}" opacity="0.7">Replace this file. No code change needed if the filename stays.</text>
  </g>
</svg>`;
}

/** The finale's arch-framed portrait on larger screens: the arch shows what will be visible. */
function portraitSvg(job) {
  const { w, h, note } = FORMATS.portrait;
  const f = (n) => Math.round((n * w) / 1200);
  const left = f(70);
  const right = w - f(70);
  const top = f(80);
  const bottom = h - f(80);
  const r = (right - left) / 2;
  const arch = `M ${left} ${bottom} L ${left} ${top + r} A ${r} ${r} 0 0 1 ${right} ${top + r} L ${right} ${bottom} Z`;
  const cx = w / 2;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  ${DEFS}
  ${field(w, h, paletteOf(job))}
  <!-- everything outside the arch is cropped away on large screens -->
  <path d="M0 0 H${w} V${h} H0 Z ${arch}" fill="#000" fill-opacity="0.5" fill-rule="evenodd"/>
  <path d="${arch}" fill="none" stroke="#ffe08a" stroke-width="${f(4)}" stroke-dasharray="${f(18)} ${f(12)}"/>
  <g text-anchor="middle" font-family="${FONT}" fill="#ffe08a" font-size="${f(26)}">
    <text x="${cx}" y="${top + r * 0.62}">KEEP THE HEAD AND SHOULDERS</text>
    <text x="${cx}" y="${top + r * 0.62 + f(38)}">INSIDE THE ARCH</text>
  </g>
  <!-- label -->
  <g transform="translate(${cx} ${h * 0.64})" text-anchor="middle" font-family="${FONT}" fill="#fff">
    <rect x="${-w * 0.38}" y="${-f(120)}" width="${w * 0.76}" height="${f(300)}" rx="${f(18)}" fill="#000" fill-opacity="0.62"/>
    <text y="${-f(74)}" font-size="${f(24)}" letter-spacing="${f(6)}" fill="#ffe08a">PHOTO PLACEHOLDER</text>
    <text y="${-f(14)}" font-size="${f(50)}" font-weight="700">${esc(job.title)}</text>
    <text y="${f(40)}" font-size="${f(28)}" font-family="Menlo, Consolas, monospace">${esc(job.file)}</text>
    <text y="${f(88)}" font-size="${f(24)}">${esc(note)}</text>
    <text y="${f(130)}" font-size="${f(20)}" opacity="0.85">${esc(job.brief)}</text>
    <text y="${f(164)}" font-size="${f(18)}" opacity="0.7">Replace this file. No code change needed if the filename stays.</text>
  </g>
</svg>`;
}

let wrote = 0;
let kept = 0;

async function render(job) {
  const out = path.join(PUBLIC_DIR, job.file);
  // Refuse anything that would write outside /public, whatever content.ts says.
  if (!out.startsWith(PUBLIC_DIR + path.sep)) throw new Error(`Refusing to write outside /public: ${job.file}`);
  if (existsSync(out) && !FORCE) {
    kept += 1;
    console.log(`  kept   ${job.file}  (already exists)`);
    return;
  }
  const { w, h } = FORMATS[job.kind];
  await mkdir(path.dirname(out), { recursive: true });
  const markup = job.kind === "portrait" ? portraitSvg(job) : svg(job);
  await sharp(Buffer.from(markup)).jpeg({ quality: 82, mozjpeg: true }).toFile(out);
  wrote += 1;
  console.log(`  wrote  ${job.file}  (${w}x${h})`);
}

// One job per photo file named in content.ts.
const jobs = [];
for (const section of SECTIONS) {
  const base = { title: section.title, swatches: section.swatches, brief: section.photo.brief };
  jobs.push({ ...base, file: section.photo.src, kind: "desktop" });
  if (section.photo.mobileSrc) jobs.push({ ...base, file: section.photo.mobileSrc, kind: "mobile" });
}
const portrait = FINALE.founder.portrait;
const finaleBase = { title: "Founder portrait", swatches: FINALE.swatches, brief: portrait.brief };
jobs.push({
  ...finaleBase,
  file: portrait.src,
  kind: portrait.desktopShape === "portrait" ? "portrait" : "desktop",
});
if (portrait.mobileSrc) {
  // On phones the finale's text and buttons cover the lower half of the portrait.
  jobs.push({
    ...finaleBase,
    file: portrait.mobileSrc,
    kind: "mobile",
    copyZone: [0.05, 0.5, 0.9, 0.46],
    zoneLabel: "TEXT AND BUTTONS SIT HERE: KEEP THIS HALF CALM AND DARK",
  });
}

console.log(`Placeholders in ${PUBLIC_DIR}${FORCE ? "  (--force: overwriting)" : ""}`);
for (const job of jobs) await render(job);
console.log(`Done: ${wrote} written, ${kept} kept.`);
