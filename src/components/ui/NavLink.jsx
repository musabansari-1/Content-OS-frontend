"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Icon from "./Icon";
import {
  navigateWithTransition,
  shouldApplyTransition,
} from "../../lib/pageTransition";

export default function NavLink({
  href,
  label,
  icon,
  active = false,
  className = "",
}) {
  const router = useRouter();

  const handleClick = (event) => {
    if (!shouldApplyTransition(event)) return;
    if (href === window.location.pathname) return; // already on this page
    event.preventDefault();
    navigateWithTransition(router, href);
  };

  return (
    <Link
      className={["nav-btn-premium", active ? "active" : "", className]
        .filter(Boolean)
        .join(" ")}
      href={href}
      onClick={handleClick}
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
