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
export function Photo({ photo, priority = false }: { photo: PhotoSpec; priority?: boolean }) {
  const common = { alt: photo.alt, fill: true, sizes: "100vw", priority } as const;
  const desktop = getImageProps({ ...common, src: photo.src });
  const style = { ...desktop.props.style, objectFit: "cover" as const, objectPosition: photo.focus };

  if (!photo.mobileSrc) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...desktop.props} alt={photo.alt} style={style} />;
  }

  const mobile = getImageProps({ ...common, src: photo.mobileSrc });
  return (
    <picture>
      <source media="(max-width: 767px)" srcSet={mobile.props.srcSet} />
      <img {...desktop.props} alt={photo.alt} style={style} />
    </picture>
  );
}
