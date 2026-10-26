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
  /** Outer and third rings of petals. */
  petal: string;
  /** Middle ring: a shade lighter, so the layers read. */
  petalInner: string;
  /** Hairline round every petal. */
  edge: string;
  /** The tight centre of the bloom. */
  core: string;
};

/** White garden roses in a few warm whites, so a cluster has depth against ivory or umber. */
export const PALETTES: Palette[] = [
  { name: "Ivory", petal: "#f4ecdd", petalInner: "#fffaf0", edge: "#b9a37a", core: "#e3cf9f" },
  { name: "Cream", petal: "#ecdfc6", petalInner: "#fbf3e1", edge: "#ab9368", core: "#d5ba80" },
  { name: "Champagne", petal: "#dcc6a0", petalInner: "#efe0c0", edge: "#9a7f52", core: "#c4a46a" },
  { name: "Blush", petal: "#ecd9cd", petalInner: "#faeee6", edge: "#a88a76", core: "#d6b896" },
  { name: "Pearl", petal: "#f1ede4", petalInner: "#ffffff", edge: "#b0a78f", core: "#dccfa9" },
];

/** Dusty eucalyptus sages, taken from the logo's green. */
export const LEAF_COLORS = ["#7f8b6a", "#97a281", "#66724f", "#a9b295"];

/** The pale paper edge round every leaf, like a cut-out. */
const CUT = "#fbf5e8";
const STEM = "#7a8665";
const SPRIG = "#fdfaf3";
const SPRIG_EDGE = "#cfc3a6";

/** A plump eucalyptus leaf, base at 0,0 and tip at 0,-84. */
const LEAF_PATH = "M0,0 C22,-12 30,-48 0,-84 C-30,-48 -22,-12 0,0 Z";

export function Leaf({ color, cut = true }: { color: string; cut?: boolean }) {
  return (
    <g>
      <path d={LEAF_PATH} fill={color} stroke={cut ? CUT : "none"} strokeWidth={1.3} strokeOpacity={0.8} />
      <path d="M0,-6 L0,-70" stroke="#3f4a31" strokeWidth={1.1} opacity={0.35} />
    </g>
  );
}

/**
 * A single white rose, centred on 0,0, with outer radius `r`: three rings of rounded petals, each
 * ring a shade different from the last, round a tight centre.
 */
export function BlossomShape({
  seed,
  r = 60,
  palette,
}: {
  seed: number;
  r?: number;
  palette: Palette;
}) {
  const rng = createRng(seed);
  const rings = [
    { count: 7, dist: 0.6, rx: 0.44, ry: 0.36, fill: palette.petal },
    { count: 6, dist: 0.4, rx: 0.36, ry: 0.3, fill: palette.petalInner },
    { count: 5, dist: 0.22, rx: 0.28, ry: 0.23, fill: palette.petal },
  ].map((ring) => {
    const start = rng() * 360;
    const petals = Array.from({ length: ring.count }, (_, i) => {
      const a = start + (360 / ring.count) * i + (rng() - 0.5) * 14;
      const rad = (a * Math.PI) / 180;
      return { x: n(Math.cos(rad) * r * ring.dist), y: n(Math.sin(rad) * r * ring.dist), a: n(a + 90) };
    });
    return { ...ring, petals };
  });
  const swirl = n(rng() * 360);

  return (
    <g>
      {rings.map((ring, ri) =>
        ring.petals.map((p, i) => (
          <ellipse
            key={`${ri}-${i}`}
            cx={p.x}
            cy={p.y}
            rx={n(r * ring.rx)}
            ry={n(r * ring.ry)}
            transform={`rotate(${p.a} ${p.x} ${p.y})`}
            fill={ring.fill}
            stroke={palette.edge}
            strokeWidth={1}
            strokeOpacity={0.55}
          />
        )),
      )}
      <circle r={n(r * 0.13)} fill={palette.core} stroke={palette.edge} strokeWidth={0.9} strokeOpacity={0.6} />
      <path
        d={`M${n(-r * 0.07)},0 A${n(r * 0.07)},${n(r * 0.07)} 0 1 1 ${n(r * 0.04)},${n(r * 0.06)}`}
        fill="none"
        stroke={palette.edge}
        strokeWidth={0.9}
        strokeOpacity={0.7}
        transform={`rotate(${swirl})`}
      />
    </g>
  );
}

/** One sprig of baby's breath: thin stems that fork upward, each tipped with a puff of tiny flowers. */
export function Gypsophila({ seed, length = 1 }: { seed: number; length?: number }) {
  const rng = createRng(seed);
  const stems = Array.from({ length: 5 }, (_, i) => {
    const angle = ((-90 + (i - 2) * 24 + (rng() - 0.5) * 12) * Math.PI) / 180;
    const len = (52 + rng() * 38) * length;
    const ex = n(Math.cos(angle) * len);
    const ey = n(Math.sin(angle) * len);
    const bend = (rng() - 0.5) * 26;
    const florets = Array.from({ length: 7 }, () => ({
      x: n(ex + (rng() - 0.5) * 26),
      y: n(ey + (rng() - 0.5) * 26),
      r: n(2.4 + rng() * 2.2),
    }));
    return { ex, ey, cx: n(ex / 2 + bend), cy: n(ey / 2), florets };
  });

  return (
    <g>
      {stems.map((s, i) => (
        <path key={`s${i}`} d={`M0,0 Q${s.cx},${s.cy} ${s.ex},${s.ey}`} fill="none" stroke={STEM} strokeWidth={1.3} strokeLinecap="round" />
      ))}
      {stems.map((s, i) =>
        s.florets.map((f, j) => (
          <circle key={`f${i}-${j}`} cx={f.x} cy={f.y} r={f.r} fill={SPRIG} stroke={SPRIG_EDGE} strokeWidth={0.7} />
        )),
      )}
    </g>
  );
}

/** A loose cluster of roses, baby's breath and eucalyptus in a 400x400 box, meant to bleed off a corner. */
export function Cluster({ seed, blooms = 3 }: { seed: number; blooms?: number }) {
  const rng = createRng(seed);
  const leaves = Array.from({ length: 6 + Math.floor(rng() * 3) }, () => ({
    x: n(120 + rng() * 160),
    y: n(120 + rng() * 160),
    a: n(rng() * 360),
    s: n(0.8 + rng() * 0.8),
    c: LEAF_COLORS[Math.floor(rng() * LEAF_COLORS.length)],
  }));
  const sprigs = Array.from({ length: 4 }, (_, i) => ({
    x: n(90 + rng() * 220),
    y: n(90 + rng() * 220),
    a: n(rng() * 360),
    s: n(0.8 + rng() * 0.5),
    seed: Math.floor(rng() * 1e6) + i,
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
      {sprigs.slice(0, 2).map((s, i) => (
        <g key={`gb${i}`} transform={`translate(${s.x} ${s.y}) rotate(${s.a}) scale(${s.s})`}>
          <Gypsophila seed={s.seed} />
        </g>
      ))}
      {flowers.map((f, i) => (
        <g key={`f${i}`} transform={`translate(${f.x} ${f.y})`}>
          <BlossomShape seed={f.seed} r={f.r} palette={f.p} />
        </g>
      ))}
      {sprigs.slice(2).map((s, i) => (
        <g key={`gf${i}`} transform={`translate(${s.x} ${s.y}) rotate(${s.a}) scale(${s.s})`}>
          <Gypsophila seed={s.seed} />
        </g>
      ))}
      {buds.map((b, i) => (
        <circle key={`b${i}`} cx={b.x} cy={b.y} r={b.r} fill={b.p.petal} stroke={b.p.edge} strokeWidth={1} strokeOpacity={0.55} />
      ))}
    </svg>
  );
}

/** A vine that hangs from the top edge, trails baby's breath, and ends in a rose that swings. */
export function HangingVine({ seed }: { seed: number }) {
  const rng = createRng(seed);
  const leaves = Array.from({ length: 6 }, (_, i) => ({
    y: n(60 + i * 48 + rng() * 14),
    side: i % 2 === 0 ? 1 : -1,
    s: n(0.45 + rng() * 0.3),
    c: LEAF_COLORS[Math.floor(rng() * LEAF_COLORS.length)],
  }));
  const sprigs = [
    { y: 130, side: -1, seed: seed + 3 },
    { y: 250, side: 1, seed: seed + 5 },
  ];

  return (
    <svg viewBox="0 0 160 460" className="h-full w-full overflow-visible" aria-hidden="true">
      <g className="wl-swing" style={{ transformOrigin: "80px 0px" }}>
        <path
          d="M80,-10 C60,80 100,150 78,230 C62,300 96,330 82,380"
          fill="none"
          stroke={STEM}
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
        {sprigs.map((s) => (
          <g key={s.seed} transform={`translate(${80 + s.side * 3} ${s.y}) rotate(${s.side * 52}) scale(0.5)`}>
            <Gypsophila seed={s.seed} />
          </g>
        ))}
        <g transform="translate(82 395)">
          <BlossomShape seed={seed + 7} r={52} palette={PALETTES[0]} />
        </g>
      </g>
    </svg>
  );
}
