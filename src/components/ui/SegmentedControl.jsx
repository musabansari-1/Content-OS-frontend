export default function SegmentedControl({
  options = [],
  value,
  onChange,
  className = "",
  name = "segmented",
}) {
  return (
    <div className={["ui-segmented", className].filter(Boolean).join(" ")} role="tablist" aria-label={name}>
      {options.map((option) => {
        const optionValue = option.value ?? option;
        const label = option.label ?? option;
        const active = value === optionValue;
        return (
          <button
            key={String(optionValue)}
            type="button"
            role="tab"
            aria-selected={active}
            className={active ? "active" : ""}
            onClick={() => onChange?.(optionValue)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
