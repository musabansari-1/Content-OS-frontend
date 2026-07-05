const icons = {
  home: (
    <path
      d="M4 10.5L10 5l6 5.5V17a1 1 0 01-1 1h-4v-5H9v5H5a1 1 0 01-1-1v-6.5z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  workspace: (
    <path
      d="M5 7h10v10H5V7zm2 2v6h6V9H7zm9-2h2v10h-2V7z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  calendar: (
    <>
      <rect height="12" rx="2" stroke="currentColor" strokeWidth="1.5" width="14" x="3" y="5" />
      <path d="M3 9h14M7 3v3M13 3v3" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
    </>
  ),
  integrations: (
    <path
      d="M8 4h4v4H8V4zm-3 8h4v4H5v-4zm8 0h4v4h-4v-4z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  billing: (
    <path
      d="M5 7h10a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V9a2 2 0 012-2zm0 4h10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  ),
  chevronDown: (
    <path d="M6 8l4 4 4-4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
  ),
  chevronRight: (
    <path d="M8 6l4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
  ),
  chevronLeft: (
    <path d="M12 6l-4 4 4 4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
  ),
  check: (
    <path d="M5 10l3 3 7-7" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
  ),
  logout: (
    <path
      d="M10 5h4v10h-4M7 10H14M12 8l2 2-2 2"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.5"
    />
  ),
  info: (
    <>
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 8.35V13" stroke="currentColor" strokeLinecap="round" strokeWidth="1.5" />
      <circle cx="10" cy="6.1" fill="currentColor" r="1" />
    </>
  ),
  spinner: (
    <circle
      cx="10"
      cy="10"
      fill="none"
      r="7"
      stroke="currentColor"
      strokeDasharray="32"
      strokeDashoffset="12"
      strokeLinecap="round"
      strokeWidth="1.5"
    />
  ),
};

export default function Icon({ name, className = "h-4 w-4", label }) {
  const paths = icons[name];

  if (!paths) {
    return null;
  }

  return (
    <svg
      aria-hidden={label ? undefined : true}
      aria-label={label}
      className={className}
      fill="none"
      role={label ? "img" : undefined}
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      {paths}
    </svg>
  );
}