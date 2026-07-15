export default function Panel({
  children,
  className = "",
  soft = false,
  flush = false,
  as: As = "article",
  ...props
}) {
  const classes = [
    soft ? "ui-panel-soft" : "ui-panel panel",
    flush ? "ui-panel-flush" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <As className={classes} {...props}>
      {children}
    </As>
  );
}
