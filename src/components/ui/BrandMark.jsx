export default function BrandMark({ size = "md", className = "", label = "CB" }) {
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
      {label}
    </div>
  );
}
