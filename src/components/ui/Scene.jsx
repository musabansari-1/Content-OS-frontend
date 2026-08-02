export default function Scene({
  children,
  className = "",
  maxWidth = "max-w-4xl",
}) {
  return (
    <div className={`auth-scene relative min-h-screen bg-bg text-ink ${className}`}>
      <div aria-hidden="true" className="auth-atmosphere">
        <div className="auth-orb auth-orb-a" />
        <div className="auth-orb auth-orb-b" />
        <div className="auth-orb auth-orb-c" />
        <div className="auth-grid" />
      </div>
      <main
        className={`relative z-10 mx-auto w-full ${maxWidth} px-5 py-8 sm:px-8 lg:px-10`}
      >
        {children}
      </main>
    </div>
  );
}
