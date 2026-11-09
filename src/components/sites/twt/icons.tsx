import type { SVGProps } from "react";
import type { ServiceIcon } from "./content";

type IconProps = SVGProps<SVGSVGElement>;

/** Shared outline style: a hairline stroke in the current text colour, like the design's icons. */
function Outline({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={28}
      height={28}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.1}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Two interlocked wedding bands with a stone set on the right one. */
export function RingsIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <circle cx="11" cy="19" r="7.5" />
      <circle cx="20" cy="17.5" r="7.5" />
      <path d="M25.2 5.2 27 7.4l-1.8 2.2-1.8-2.2 1.8-2.2Z" />
    </Outline>
  );
}

/** A flowering sprig: three petals on a stem with two leaves. */
export function SprigIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <path d="M16 29V13" />
      <path d="M16 13c-3.8-.4-5.8-2.8-5.8-6 3.6.2 5.6 2.4 5.8 6Z" />
      <path d="M16 13c3.8-.4 5.8-2.8 5.8-6-3.6.2-5.6 2.4-5.8 6Z" />
      <path d="M16 13c-1.8-2.2-1.8-5 0-7.4 1.8 2.4 1.8 5.2 0 7.4Z" />
      <path d="M16 23c-3.2-.2-5.6-2-6.2-5 3.2.2 5.6 2 6.2 5Z" />
      <path d="M16 20.5c3.2-.2 5.6-2 6.2-5-3.2.2-5.6 2-6.2 5Z" />
    </Outline>
  );
}

/** A briefcase with a clasp. */
export function BriefcaseIcon(props: IconProps) {
  return (
    <Outline {...props}>
      <rect x="4" y="10" width="24" height="16" rx="1.6" />
      <path d="M12 10V7.6A1.6 1.6 0 0 1 13.6 6h4.8A1.6 1.6 0 0 1 20 7.6V10" />
      <path d="M4 17h24" />
      <path d="M14 16v3h4v-3" />
    </Outline>
  );
}

const ICONS: Record<ServiceIcon, (props: IconProps) => React.JSX.Element> = {
  rings: RingsIcon,
  sprig: SprigIcon,
  briefcase: BriefcaseIcon,
};

export function ServiceGlyph({ name, ...props }: IconProps & { name: ServiceIcon }) {
  const Icon = ICONS[name];
  return <Icon {...props} />;
}
