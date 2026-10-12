import { getImageProps } from "next/image";
import type { Photo as PhotoSpec } from "./content";

/**
 * Full-bleed photo with optional art direction: phones get `mobileSrc` (a portrait crop) and
 * everything else gets `src`. It fills its positioned parent and is cover-cropped.
 *
 * It uses a plain <img> inside <picture> on purpose: `getImageProps` hands back the same
 * optimised, responsive `srcSet` that <Image> would, and the <picture> element is what lets the
 * browser choose between the two crops.
 */
export function Photo({
  photo,
  priority = false,
  sizes = "100vw",
}: {
  photo: PhotoSpec;
  priority?: boolean;
  /** How wide the photo is drawn, so the browser picks a right-sized file. Full width by default. */
  sizes?: string;
}) {
  const common = { alt: photo.alt, fill: true, sizes, priority } as const;
  const desktop = getImageProps({ ...common, src: photo.src });
  const style = { ...desktop.props.style, objectFit: "cover" as const, objectPosition: photo.focus };

  if (!photo.mobileSrc) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...desktop.props} alt={photo.alt} style={style} />;
  }

  const mobile = getImageProps({ ...common, src: photo.mobileSrc });
  return (
    <picture>
      {/* Unoptimized images (development, see next.config.ts) have no srcSet: use the plain src. */}
      <source media="(max-width: 767px)" srcSet={mobile.props.srcSet ?? mobile.props.src} />
      <img {...desktop.props} alt={photo.alt} style={style} />
    </picture>
  );
}
