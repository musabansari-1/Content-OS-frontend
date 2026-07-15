export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions = null,
  className = "",
  as: TitleTag = "h1",
}) {
  return (
    <header className={["ui-page-header", className].filter(Boolean).join(" ")}>
      <div className="ui-page-header-copy">
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        {title ? <TitleTag>{title}</TitleTag> : null}
        {subtitle ? <p className="ui-page-header-subtitle">{subtitle}</p> : null}
      </div>
      {actions ? <div className="ui-page-header-actions">{actions}</div> : null}
    </header>
  );
}
