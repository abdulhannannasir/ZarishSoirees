# Wedding Wonderland — page brief

A single-screen, scroll-driven showcase for a maximalist wedding event management and
decoration studio. Its structure and motion were modelled on a campaign microsite
(`moooi.com/en/a-life-extraordinary`, observed 2026-10-12 at 1024x768), then reskinned.

**Content decision:** nothing from that site's artwork, photography or copy is used. All copy is
original, all illustration is generated in code, and all photography is the studio's own
(placeholders until it is supplied). What is modelled is layout, type scale, timing and
interaction. Fonts are open stand-ins (Cormorant Garamond, Jost), not the source's licensed faces.

## Where things live

| Want to change | Edit |
| --- | --- |
| Any text, image path, alt text, palette, hash id | `src/components/sites/wedding-wonderland/content.ts` |
| Placeholder images | `npm run placeholders` (reads `content.ts`), or drop real files in `public/` |
| Scene logic, scrolling, sound, header | `wonderland.tsx` |
| Section layout (photo, scrim, copy block) | `showpiece-scene.tsx` |
| Phone/desktop photo selection | `photo.tsx` |
| Timing, parallax depths, transitions | `wonderland.css` |
| Intro blossoms (generated SVG) | `art.tsx` |

## Structure

| # | Hash | Title | Photo (desktop / phone) |
| --- | --- | --- | --- |
| – | `/` | Hero: "Step into the Extraordinary." | none, black stage with cut-out blooms |
| 1 | `#grand-entrances` | Grand Entrances | `grand-entrance-vibrant.jpg` / `…-mobile.jpg` |
| 2 | `#bespoke-stage-backdrop` | Bespoke Stage & Backdrop Design | `bespoke-stage-backdrop.jpg` / `…-mobile.jpg` |
| 3 | `#floral-architecture` | Floral Architecture | `floral-architecture-hanging.jpg` / `…-mobile.jpg` |
| 4 | `#custom-table-settings` | Custom Table Settings | `custom-table-setting.jpg` / `…-mobile.jpg` |
| 5 | `#lighting-ambience` | Lighting & Ambience | `lighting-ambience-canopy.jpg` / `…-mobile.jpg` |

## Interaction model (carried over from the structural reference)

Single `100dvh` screen, no document scroll. **The hash is the destination of Enter**: a hash
present at load still shows the hero, and Enter lands in that section.

1. **Hero** — black, drifting cut-out blooms at the corners. Eyebrow → two-line uppercase
   headline → italic tagline → white **Enter** pill → greeting line. Wordmark top-centre,
   round sound toggle bottom-left.
2. **Enter (~3.4 s)** — everything but the headline fades; the headline scales past the viewport
   (camera push) while the blooms fly outward; section 1 rises behind it, dim and oversized.
3. **Sections** — each is a full-bleed photo with a legibility gradient, floating blooms, and a
   bottom-left copy block (index, kicker, title, body) that rises in line by line.
4. **Moving between sections** — the active section zooms past the viewer while the next rises
   from the distance; going back reverses it. Triggered by wheel/touch/arrows past the end of a
   section, the "Scroll to explore the magic" button, the section dots, or the hash.

## Parallax and 3D feel

Each section owns a scroll variable `--p` (0..1), eased toward its target every frame. Layers
read it at different depths, so the scene has depth without 3D transforms:

| Layer | Motion at `--p` = 1 |
| --- | --- |
| Photo | scale 1.08 → 1.22, drifts up 4 % |
| Foreground bloom (upper) | up 90 px, rotates 6° |
| Foreground bloom (lower) | up 220 px, scales 1.18×, rotates −8° |
| Copy block | up 48 px |

Because every section has its own `--p`, a section that is flying away keeps its last position
instead of snapping back to zero.

## Input rules

- Wheel range: 900 px traverses one section (`WHEEL_RANGE` in `wonderland.tsx`).
- Pushing past a section's end by more than 0.18 (≈ 160 px) goes to the next one; pushing past
  its start goes back, arriving at the previous section's end.
- Input is ignored for 2.4 s after a switch so one flick cannot skip a section.
- Keys: ↑/↓/PageUp/PageDown move within a section and cross at the ends; Home/End stay inside it.
- Editing the hash by hand switches sections. Home clears the hash and returns to the hero.

## Photo guidance (also written next to each photo in `content.ts`)

- Landscape 16:9, at least 2880 × 1620 px, JPG q80-85. It zooms to 1.22×, so more pixels stay sharper.
- Optional portrait crop for phones, 3:5, at least 1200 × 2000 px (`mobileSrc`). Without it, the
  landscape photo is cropped to a narrow slice on phones.
- Keep the subject inside the middle 60 % of the width; use `focus` to shift the crop.
- Copy sits bottom-left over a dark gradient: keep that corner calm. The placeholders draw this
  zone, the safe box, the filename and the recommended size on themselves.

## Known gaps

- No contact / enquiry call to action yet; the site ends on the last section.
- Placeholders are gradients, not photographs. Real photos will change how well the scrim holds:
  check very bright images (white linen, daylight) and raise the scrim in `wonderland.css` if needed.
- All five photos load up front (they are stacked in the page) so transitions never wait on the
  network. With heavy photography, consider lazy-loading sections 3-5.
- Verified in a browser pane that renders at about 1 frame per second, so real-time smoothness
  of the scroll easing and parallax was checked through computed values and forced-repaint
  screenshots, not by watching it run.
- Sound is a generated ambient pad. Whether music suits a wedding site is a brand decision; it is
  a single `useAmbientSound` call in `wonderland.tsx`.
