export default function Notice({
  children,
  message,
  kind = "info",
  actionUrl = "",
  actionLabel = "",
  className = "",
}) {
  const content = children || message;
  if (!content) return null;

  return (
    <div className={["ui-notice", `ui-notice-${kind}`, className].filter(Boolean).join(" ")}>
      {typeof content === "string" ? <p>{content}</p> : content}
      {actionUrl && actionLabel ? (
        <a
          className="text-link-button"
          href={actionUrl}
          rel="noreferrer"
          target="_blank"
        >
          {actionLabel}
        </a>
      ) : null}
    </div>
  );
}

export function Banner({
  children,
  className = "",
  actions = null,
  eyebrow,
  title,
  description,
}) {
  return (
    <section className={["ui-banner", "auth-banner", className].filter(Boolean).join(" ")}>
      <div>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        {title ? <h2>{title}</h2> : null}
        {description ? <p className="muted-copy">{description}</p> : null}
        {children}
      </div>
      {actions ? <div className="ui-banner-actions auth-banner-actions">{actions}</div> : null}
    </section>
  );
}
