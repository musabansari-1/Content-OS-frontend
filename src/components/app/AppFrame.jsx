"use client";

import Link from "next/link";
import { GenerationLoader } from "./WorkspacePage";
import { useAppState } from "./AppProvider";

function AuthScreen() {
  const {
    authMode,
    setAuthMode,
    authForm,
    authStatus,
    authError,
    handleAuthChange,
    handleAuthSubmit,
  } = useAppState();

  return (
    <div className="app-shell">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />
      <main className="app auth-layout">
        <section className="hero hero-left">
          <p className="eyebrow">ContentOS</p>
          <h1>
            Build once.<span>Ship the right assets everywhere.</span>
          </h1>
          <p className="hero-copy">
            Create an account, save your creator voice profile, and turn each
            generation into a persistent workspace instead of a disposable AI
            response.
          </p>
          <div className="hero-pills">
            <span>User auth</span>
            <span>Saved voice profile</span>
            <span>Persistent workspace</span>
          </div>
        </section>

        <section className="panel auth-panel">
          <div className="auth-toggle">
            <button
              className={authMode === "login" ? "active" : ""}
              onClick={() => setAuthMode("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={authMode === "register" ? "active" : ""}
              onClick={() => setAuthMode("register")}
              type="button"
            >
              Register
            </button>
          </div>
          <div className="panel-heading">
            <h2>{authMode === "login" ? "Welcome back" : "Create your workspace"}</h2>
            <p className="muted-copy">
              {authMode === "login"
                ? "Sign in to access your saved creator voice profile and asset library."
                : "Create an account so your voice profile and workspace stay attached to you."}
            </p>
          </div>
          <form className="stack-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" ? (
              <label className="field">
                <span>Display name</span>
                <input
                  type="text"
                  placeholder="Aman"
                  value={authForm.displayName}
                  onChange={(event) =>
                    handleAuthChange("displayName", event.target.value)
                  }
                />
              </label>
            ) : null}
            <label className="field">
              <span>Email</span>
              <input
                type="email"
                placeholder="you@example.com"
                value={authForm.email}
                onChange={(event) => handleAuthChange("email", event.target.value)}
              />
            </label>
            <label className="field">
              <span>Password</span>
              <input
                type="password"
                placeholder="At least 8 characters"
                value={authForm.password}
                onChange={(event) =>
                  handleAuthChange("password", event.target.value)
                }
              />
            </label>
            <button
              className="primary-button"
              type="submit"
              disabled={authStatus === "loading"}
            >
              {authStatus === "loading"
                ? authMode === "login"
                  ? "Signing in..."
                  : "Creating account..."
                : authMode === "login"
                  ? "Login"
                  : "Create account"}
            </button>
          </form>
          {authError ? <p className="error">{authError}</p> : null}
        </section>
      </main>
    </div>
  );
}

export default function AppFrame({ route, children }) {
  const {
    bootStatus,
    token,
    user,
    handleLogout,
    generateStatus,
    generateJob,
    selectedAssets,
    targetAssets,
  } = useAppState();

  if (bootStatus === "loading") {
    return (
      <div className="app-shell">
        <main className="app app-loading">
          <div className="panel boot-panel">
            <p className="eyebrow">ContentOS</p>
            <h1>Loading your workspace</h1>
            <p className="muted-copy">
              Reconnecting your auth session and voice profile.
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (!token || !user) {
    return <AuthScreen />;
  }

  return (
    <div className="app-shell">
      <div className="ambient ambient-1" />
      <div className="ambient ambient-2" />

      <main className="app workspace-layout">
        <header className="header">
          <div className="header-brand">
            <div className="brand-mark">CO</div>
            <div className="brand-text">
              <span className="brand-name">ContentOS</span>
              <span className="brand-tagline">Content workspace</span>
            </div>
          </div>
          <div className="header-divider" />
          <div className="header-greeting">
            <p className="greeting-name">
              Hi, <span>{user.display_name}</span>
            </p>
            <p className="greeting-sub">Create once. Repurpose everywhere.</p>
          </div>
          <nav className="header-nav">
            <Link className={`nav-btn ${route === "home" ? "active" : ""}`} href="/">
              Main page
            </Link>
            <Link
              className={`nav-btn ${route === "workspace" ? "active" : ""}`}
              href="/workspace"
            >
              Workspace
            </Link>
            <Link
              className={`nav-btn ${route === "integrations" ? "active" : ""}`}
              href="/integrations"
            >
              Integrations
            </Link>
          </nav>
          <div className="header-right">
            <div className="user-pill">
              <div className="user-avatar">
                {user.display_name.slice(0, 2).toUpperCase()}
              </div>
              <div className="user-info">
                <span className="user-name">{user.display_name}</span>
                <span className="user-email">{user.email}</span>
              </div>
            </div>
            <button className="logout-btn" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </header>

        {children}
      </main>

      {generateStatus === "loading" ? (
        <GenerationLoader
          job={generateJob}
          selectedAssets={selectedAssets}
          targetAssets={targetAssets}
        />
      ) : null}
    </div>
  );
}
