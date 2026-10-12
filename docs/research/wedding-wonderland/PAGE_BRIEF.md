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
| Any text, image path, alt text, palette, hash id, WhatsApp link, founder bio, form fields | `src/components/sites/wedding-wonderland/content.ts` |
| Placeholder images | `npm run placeholders` (reads `content.ts`; skips files that already exist, `-- --force` overwrites them), or drop real files in `public/` |
| Scene logic, scrolling, sound, header | `wonderland.tsx` |
| Section layout (photo, scrim, copy block) | `showpiece-scene.tsx` |
| Finale layout (portrait, headline, the two buttons) | `finale-scene.tsx` |
| Consultation form (validation, WhatsApp hand-off) | `consultation-modal.tsx` |
| Phone/desktop photo selection | `photo.tsx` |
| Timing, parallax depths, transitions, the gold button | `wonderland.css` |
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
| 6 | `#meet-the-founder` | Meet the Founder & Book a Consultation (finale) | `founder-portrait.jpg` (4:5, arch frame) / `founder-portrait-mobile.jpg` (3:5, full-bleed) |

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
5. **Finale (scene 6)** — a dark stage instead of a full-bleed photo. Eyebrow "06 / 06 — Begin
   the Journey", the headline "Let’s create your extraordinary.", the founder's name, role and a
   short bio, then two buttons: a gold **Chat on WhatsApp** link and an outlined **Schedule a
   Private Consultation** that opens the form (below). On phones the portrait fills the screen and
   the copy sits over its darkened lower half; from 768 px up the portrait sits in a gold-outlined
   arch beside the copy. It runs on the same scene machine as sections 1-5 (zoom/fade in, `--p`
   parallax, its own hash), but nothing follows it, so the scroll hint hides here.

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
- While the consultation form or the moodboard is open, wheel, touch and keys do nothing behind it.

## Consultation form (finale)

A dark dialog opened by **Schedule a Private Consultation**.

| Field | Required | Rule |
| --- | --- | --- |
| Your name | yes | not blank |
| Event date | yes | today or later (the browser's date picker, forced to its dark scheme) |
| Venue | no | free text |
| Guest count | no | whole number, 1-99999 |
| Services needed | no | checkboxes: the five sections plus "Full event management" |

Labels, placeholders, error messages and the required flags all live in `FINALE.consultation`.

**There is no server behind it.** On submit the form is validated, a plain-text message is built
from the answers, and `https://wa.me/923137027761?text=…` opens in a new tab; the visitor then
presses send in WhatsApp. Nothing is stored or transmitted by this site. The dialog switches to
"Your request is ready" with an **Open WhatsApp** link as a fallback for blocked pop-ups. To
receive requests by email or in a CRM instead, replace the body of `onSubmit` in
`consultation-modal.tsx` (typically a POST to a Route Handler).

Typed values survive an accidental close; after a send the next opening starts empty.
Accessibility: `role="dialog"` with `aria-modal`, focus moves to the first field and returns to the
button that opened it, Escape / the X / a click on the backdrop close it, Tab stays inside (even if
focus slipped out after a click on plain text), each error is announced and the first invalid field
takes focus, and the X stays pinned while the form scrolls on a phone. The dialog is mounted
outside the scenes because their transforms would break its positioning.

## Photo guidance (also written next to each photo in `content.ts`)

- Landscape 16:9, at least 2880 × 1620 px, JPG q80-85. It zooms to 1.22×, so more pixels stay sharper.
- Optional portrait crop for phones, 3:5, at least 1200 × 2000 px (`mobileSrc`). Without it, the
  landscape photo is cropped to a narrow slice on phones.
- Keep the subject inside the middle 60 % of the width; use `focus` to shift the crop.
- Copy sits bottom-left over a dark gradient: keep that corner calm. The placeholders draw this
  zone, the safe box, the filename and the recommended size on themselves.
- **Founder portrait** (finale): phones show the 3:5 crop (`mobileSrc`, at least 1200 × 2000 px)
  full-bleed with the copy and buttons over its lower half, so keep the face and shoulders in the
  upper middle. From 768 px up the 4:5 file (`src`, at least 1600 × 2000 px) is shown in an arch,
  so keep the head and shoulders inside the curve. The generated placeholders draw both guides.

## Images in development vs production

- `next dev` serves photos from `/public` as plain files (`images.unoptimized` in
  `next.config.ts`). Swap a photo under the same filename and a normal reload shows it: there is no
  image cache to clear. The cost is that dev loads your originals at full size, so a set of large
  photos makes the dev page heavier. That does not affect production.
- `next build` / production optimizes every image (responsive sizes, WebP) and caches the results
  for 4 hours (`minimumCacheTTL`, Next's default). A self-hosted server with a persistent cache
  folder therefore keeps showing an old photo for up to 4 hours after a swap unless
  `<distDir>/cache/images` is deleted. A fresh deployment starts with an empty cache.
- Why not just `minimumCacheTTL: 0` in dev? Next serves a stale cached image once while it
  re-optimizes in the background, so the first reload after a swap would still show the old photo.
- Optimizer-specific problems (an unsupported format, a missing file hidden by the cache) only show
  up in a production build, so check one before launch.

## Known gaps

- The founder's name ("Zarish"), role and bio are placeholders: edit `FINALE.founder` in `content.ts`.
- `founder-portrait-mobile.jpg` is a real photo, but the desktop `founder-portrait.jpg` is still a
  generated placeholder, so phones and desktops currently show different pictures.
- The consultation form hands off to WhatsApp instead of saving anything. A request only reaches
  the studio if the visitor presses send there; to capture every enquiry, add a server-side route
  (email or CRM, with spam protection). The WhatsApp number is public in the page source, as it
  is for any `wa.me` link.
- Placeholders are gradients, not photographs. Real photos will change how well the scrim holds:
  check very bright images (white linen, daylight) and raise the scrim in `wonderland.css` if needed.
- All six scenes' photos load up front (they are stacked in the page) so transitions never wait on
  the network. With heavy photography, consider lazy-loading scenes 3-6.
- Verified in a browser pane that renders at about 1 frame per second, so real-time smoothness
  of the scroll easing and parallax was checked through computed values and forced-repaint
  screenshots, not by watching it run.
- Sound is a generated ambient pad. Whether music suits a wedding site is a brand decision; it is
  a single `useAmbientSound` call in `wonderland.tsx`.
