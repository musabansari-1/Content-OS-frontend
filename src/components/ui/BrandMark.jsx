/**
 * Brand mark — "One video, every asset."
 *
 * A play triangle (the source video) sits at the center, with four small
 * vertical-video cards radiating outward on the diagonals. The composition
 * encodes the product's core promise: create multiple assets from a single
 * video. The icon inherits its color from the container (`currentColor`) and
 * is decorative (`aria-hidden`): every usage site renders the brand name as
 * adjacent text.
 */
export default function BrandMark({ size = "md", className = "" }) {
  return (
    <div
      aria-hidden="true"
      className={[
        "ui-brand-mark",
        "brand-mark",
        `ui-brand-mark-${size}`,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* source video — play triangle */}
        <path d="M10 7.4 L10 16.6 L16.4 12 Z" fill="currentColor" />
        {/* assets — vertical-video cards bursting outward */}
        <g fill="currentColor">
          <rect
            x="14.65"
            y="5.05"
            width="3"
            height="4"
            rx="1"
            transform="rotate(10 16.15 7.05)"
            opacity="0.9"
          />
          <rect
            x="6.35"
            y="5.05"
            width="3"
            height="4"
            rx="1"
            transform="rotate(-10 7.85 7.05)"
            opacity="0.9"
          />
          <rect
            x="14.65"
            y="14.95"
            width="3"
            height="4"
            rx="1"
            transform="rotate(-10 16.15 16.95)"
            opacity="0.9"
          />
          <rect
            x="6.35"
            y="14.95"
            width="3"
            height="4"
            rx="1"
            transform="rotate(10 7.85 16.95)"
            opacity="0.9"
          />
        </g>
      </svg>
    </div>
  );
}
