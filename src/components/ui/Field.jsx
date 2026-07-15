export default function Field({
  label,
  hint,
  children,
  className = "",
  htmlFor,
}) {
  return (
    <label className={["ui-field", "field", className].filter(Boolean).join(" ")} htmlFor={htmlFor}>
      {label ? <span className="ui-field-label">{label}</span> : null}
      {children}
      {hint ? <span className="ui-field-hint">{hint}</span> : null}
    </label>
  );
}

export function Input({ className = "", ...props }) {
  return <input className={["ui-input", className].filter(Boolean).join(" ")} {...props} />;
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea className={["ui-textarea", className].filter(Boolean).join(" ")} {...props} />
  );
}
