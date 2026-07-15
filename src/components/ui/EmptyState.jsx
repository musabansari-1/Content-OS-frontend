export default function EmptyState({
  icon = null,
  title,
  description,
  action = null,
  className = "",
  large = false,
}) {
  return (
    <div
      className={[
        "ui-empty",
        "empty-panel",
        large ? "large" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {icon ? <div className="ui-empty-icon">{icon}</div> : null}
      {title ? <h3>{title}</h3> : null}
      {description ? <p className="muted-copy">{description}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
