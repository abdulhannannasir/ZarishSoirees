/** Deterministic PRNG (mulberry32) so server and client render identical SVG. */
export function createRng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Round to 2 decimals so engine-level float differences never reach the markup. */
const n = (v: number) => Math.round(v * 100) / 100;

export type Palette = {
  name: string;
  petal: string;
  petalInner: string;
  vein: string;
  core: string;
  dots: string;
};

export const PALETTES: Palette[] = [
  { name: "Garnet", petal: "#b3262d", petalInner: "#e2683f", vein: "#5b0f17", core: "#d9a441", dots: "#fff1d6" },
  { name: "Cream", petal: "#efe3cf", petalInner: "#fff8ea", vein: "#c9b79b", core: "#d9a441", dots: "#8a5a2b" },
  { name: "Ember", petal: "#e2683f", petalInner: "#f2a65a", vein: "#8c2f14", core: "#7a1f2b", dots: "#ffe9b8" },
  { name: "Indigo", petal: "#3a4f9b", petalInner: "#7f93d6", vein: "#16224f", core: "#efe3cf", dots: "#d9a441" },
  { name: "Saffron", petal: "#d9a441", petalInner: "#f3d27a", vein: "#8a6416", core: "#b3262d", dots: "#fff1d6" },
];

export const LEAF_COLORS = ["#1f7a72", "#2b8f6b", "#14564f", "#3c6e3a"];

const CUT = "#f6ead7";

function petalPath(r: number, w: number) {
  return `M0,0 C${n(-w)},${n(-r * 0.35)} ${n(-w * 0.85)},${n(-r * 0.95)} 0,${n(-r)} C${n(w * 0.85)},${n(-r * 0.95)} ${n(w)},${n(-r * 0.35)} 0,0 Z`;
}

const LEAF_PATH = "M0,0 C18,-20 24,-62 0,-110 C-24,-62 -18,-20 0,0 Z";

export function Leaf({ color, cut = true }: { color: string; cut?: boolean }) {
  return (
    <g>
      <path d={LEAF_PATH} fill={color} stroke={cut ? CUT : "none"} strokeWidth={1.4} strokeOpacity={0.85} />
      <path d="M0,-6 L0,-96" stroke="#06231f" strokeWidth={1.2} opacity={0.45} />
    </g>
  );
}

/** A single paper-cut style blossom, centered on 0,0, with outer radius `r`. */
export function BlossomShape({
  seed,
  r = 60,
  palette,
  cut = true,
}: {
  seed: number;
  r?: number;
  palette: Palette;
  cut?: boolean;
}) {
  const rng = createRng(seed);
  const count = 5 + Math.floor(rng() * 5);
  const w = r * (0.34 + rng() * 0.16);
  const rot0 = rng() * 360;
  const angles = Array.from({ length: count }, (_, i) => n(rot0 + (360 / count) * i + (rng() - 0.5) * 8));
  const dotCount = 7 + Math.floor(rng() * 5);
  const dots = Array.from({ length: dotCount }, (_, i) => {
    const a = (Math.PI * 2 * i) / dotCount;
    return { x: n(Math.cos(a) * r * 0.3), y: n(Math.sin(a) * r * 0.3) };
  });

  return (
    <g>
      {angles.map((a, i) => (
        <g key={i} transform={`rotate(${a})`}>
          <path
            d={petalPath(r, w)}
            fill={palette.petal}
            stroke={cut ? CUT : "none"}
            strokeWidth={1.4}
            strokeOpacity={0.85}
          />
          <path d={petalPath(r * 0.62, w * 0.55)} fill={palette.petalInner} opacity={0.85} />
          <path d={`M0,${n(-r * 0.14)} L0,${n(-r * 0.86)}`} stroke={palette.vein} strokeWidth={1} opacity={0.5} />
        </g>
      ))}
      <circle r={n(r * 0.2)} fill={palette.core} />
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r={n(r * 0.035)} fill={palette.dots} />
      ))}
    </g>
  );
}

/** A loose cluster of blossoms and leaves in a 400x400 box, meant to bleed off a corner. */
export function Cluster({ seed, blooms = 3 }: { seed: number; blooms?: number }) {
  const rng = createRng(seed);
  const leaves = Array.from({ length: 5 + Math.floor(rng() * 3) }, () => ({
    x: n(120 + rng() * 160),
    y: n(120 + rng() * 160),
    a: n(rng() * 360),
    s: n(0.8 + rng() * 0.9),
    c: LEAF_COLORS[Math.floor(rng() * LEAF_COLORS.length)],
  }));
  const flowers = Array.from({ length: blooms }, (_, i) => ({
    x: n(110 + rng() * 180),
    y: n(110 + rng() * 180),
    r: n(46 + rng() * 44),
    seed: Math.floor(rng() * 1e6) + i,
    p: PALETTES[Math.floor(rng() * PALETTES.length)],
  }));
  const buds = Array.from({ length: 4 }, () => ({
    x: n(60 + rng() * 280),
    y: n(60 + rng() * 280),
    r: n(10 + rng() * 14),
    p: PALETTES[Math.floor(rng() * PALETTES.length)],
  }));

  return (
    <svg viewBox="0 0 400 400" className="h-full w-full overflow-visible" aria-hidden="true">
      {leaves.map((l, i) => (
        <g key={`l${i}`} transform={`translate(${l.x} ${l.y}) rotate(${l.a}) scale(${l.s})`}>
          <Leaf color={l.c} />
        </g>
      ))}
      {flowers.map((f, i) => (
        <g key={`f${i}`} transform={`translate(${f.x} ${f.y})`}>
          <BlossomShape seed={f.seed} r={f.r} palette={f.p} />
        </g>
      ))}
      {buds.map((b, i) => (
        <circle key={`b${i}`} cx={b.x} cy={b.y} r={b.r} fill={b.p.petal} stroke={CUT} strokeWidth={1.2} strokeOpacity={0.85} />
      ))}
    </svg>
  );
}

/** A vine that hangs from the top edge and ends in a blossom that swings. */
export function HangingVine({ seed }: { seed: number }) {
  const rng = createRng(seed);
  const leaves = Array.from({ length: 6 }, (_, i) => ({
    y: n(60 + i * 48 + rng() * 14),
    side: i % 2 === 0 ? 1 : -1,
    s: n(0.45 + rng() * 0.3),
    c: LEAF_COLORS[Math.floor(rng() * LEAF_COLORS.length)],
  }));

  return (
    <svg viewBox="0 0 160 460" className="h-full w-full overflow-visible" aria-hidden="true">
      <g className="wl-swing" style={{ transformOrigin: "80px 0px" }}>
        <path
          d="M80,-10 C60,80 100,150 78,230 C62,300 96,330 82,380"
          fill="none"
          stroke="#2b8f6b"
          strokeWidth={3}
          strokeLinecap="round"
        />
        {leaves.map((l, i) => (
          <g
            key={i}
            transform={`translate(${n(80 + l.side * 4)} ${l.y}) rotate(${l.side * 62}) scale(${l.s})`}
          >
            <Leaf color={l.c} />
          </g>
        ))}
        <g transform="translate(82 395)">
          <BlossomShape seed={seed + 7} r={52} palette={PALETTES[0]} />
        </g>
      </g>
    </svg>
  );
}
