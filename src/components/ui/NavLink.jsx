import Link from "next/link";
import Icon from "./Icon";

export default function NavLink({
  href,
  label,
  icon,
  active = false,
  className = "",
}) {
  return (
    <Link
      className={["nav-btn-premium", active ? "active" : "", className]
        .filter(Boolean)
        .join(" ")}
      href={href}
    >
      {icon ? (
        <span className="nav-btn-icon">
          <Icon name={icon} className="h-4 w-4" />
        </span>
      ) : null}
      <span className="nav-btn-label">{label}</span>
    </Link>
  );
}