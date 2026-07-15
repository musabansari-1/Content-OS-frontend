export default function Button({
  children,
  variant = "primary",
  size = "md",
  pill = false,
  className = "",
  type = "button",
  disabled = false,
  as: As = "button",
  href,
  ...props
}) {
  const classes = [
    "ui-btn",
    `ui-btn-${variant}`,
    `ui-btn-${size}`,
    pill ? "ui-btn-pill" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (As === "a" || href) {
    return (
      <a className={classes} href={href} {...props}>
        {children}
      </a>
    );
  }

  return (
    <As className={classes} type={type} disabled={disabled} {...props}>
      {children}
    </As>
  );
}
