"use client";

import Link from "next/link";
import { useRef } from "react";
import { GenerationLoader } from "./WorkspacePage";
import { useAppState } from "./AppProvider";

function AuthCard({ authSectionRef }) {
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
    <section
      className="panel auth-panel landing-auth-card"
      id="auth"
      ref={authSectionRef}
    >
      <div className="landing-auth-copy">
        <p className="eyebrow">Start now</p>
        <h2>{authMode === "login" ? "Welcome back" : "Create your workspace"}</h2>
        <p className="muted-copy">
          {authMode === "login"
            ? "Sign in to continue generating assets inside your saved workspace."
            : "Create an account so your voice profile, outputs, and billing history stay attached to you."}
        </p>
      </div>
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
      <form className="stack-form" onSubmit={handleAuthSubmit}>
        {authMode === "register" ? (
          <label className="field">
            <span>Display name</span>
            <input
              type="text"
              placeholder="Aman"
              value={authForm.displayName}
              onChange={(event) => handleAuthChange("displayName", event.target.value)}
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
            onChange={(event) => handleAuthChange("password", event.target.value)}
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
  );
}

function AuthScreen() {
  const authSectionRef = useRef(null);

  const scrollToAuth = (event) => {
    event.preventDefault();
    authSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div className="relative min-h-screen bg-[#0f141c] text-[#f6efe7]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-[#c98f65]/20 blur-[90px]" />
        <div className="absolute bottom-[-140px] right-[-120px] h-[380px] w-[380px] rounded-full bg-[#8fb8b2]/16 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <header className="landing-topbar">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#d8a36f] to-[#8fb8b2] font-bold text-[#111820] shadow-lg shadow-[#d8a36f]/20">
              CO
            </div>

            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight">
                ContentOS
              </span>
              <span className="text-xs text-[#b9aca0]">
                AI content operating system
              </span>
            </div>
          </div>

          <nav className="landing-topnav text-sm text-[#c8beb4]">
            <a className="transition hover:text-white" href="#product">
              Product
            </a>
            <a className="transition hover:text-white" href="#workflow">
              Workflow
            </a>
            <a className="transition hover:text-white" href="#pricing">
              What&apos;s next
            </a>
            <a
              className="transition hover:text-white"
              href="#auth"
              onClick={scrollToAuth}
            >
              Login
            </a>
          </nav>
        </header>

        <section className="mt-5 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl shadow-black/30 backdrop-blur sm:p-8 lg:p-10">
          <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <section className="pt-4">
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#d8a36f]">
                For creators and lean teams
              </p>

              <h1 className="max-w-3xl text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-6xl">
                Repurpose one video into weeks of content.
                <span className="mt-3 block text-[#d8c7b5]">
                  Built for creators who publish everywhere.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-8 text-[#c8beb4] sm:text-lg">
                ContentOS transforms videos, transcripts, and ideas into
                platform-specific content while keeping your voice, drafts, and
                assets organized in one workspace.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                {[
                  "Saved voice profile",
                  "Reusable workspace",
                  "Multi-asset generation",
                  "Platform-ready outputs",
                ].map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-[#d8c7b5]"
                  >
                    {item}
                  </span>
                ))}
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  className="rounded-full bg-[#d8a36f] px-6 py-3 text-sm font-semibold text-[#111820] shadow-lg shadow-[#d8a36f]/20 transition hover:-translate-y-0.5 hover:bg-[#e4b47f]"
                  href="#auth"
                  onClick={scrollToAuth}
                >
                  Get started
                </a>

                <a
                  className="rounded-full border border-white/10 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-[#f6efe7] transition hover:-translate-y-0.5 hover:bg-white/[0.07]"
                  href="#product"
                >
                  See how it works
                </a>
              </div>

              <div className="mt-10 grid max-w-2xl gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-[#151b25]/80 p-5">
                  <strong className="block text-sm text-white">One source</strong>
                  <span className="mt-1 block text-sm text-[#b9aca0]">
                    Video
                  </span>
                </div>

                <div className="rounded-2xl border border-white/10 bg-[#151b25]/80 p-5">
                  <strong className="block text-sm text-white">Many outputs</strong>
                  <span className="mt-1 block text-sm text-[#b9aca0]">
                    Posts, threads, blogs, newsletters, short clips and more
                  </span>
                </div>
              </div>
            </section>

            <aside className="grid gap-5" id="auth">
              <div className="rounded-[1.5rem] border border-white/10 bg-[#151b25]/80 p-5 shadow-xl shadow-black/20">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[#d8a36f]">
                    Product preview
                  </p>
                  <span className="rounded-full border border-[#8fb8b2]/30 bg-[#8fb8b2]/10 px-3 py-1 text-xs font-medium text-[#b9d8d2]">
                    Workspace-first
                  </span>
                </div>

                <div className="grid gap-3">
                  <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <strong className="text-sm text-white">
                      1. Capture your voice
                    </strong>
                    <p className="mt-1 text-sm leading-6 text-[#b9aca0]">
                      Save writing samples or YouTube transcripts once.
                    </p>
                  </article>

                  <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <strong className="text-sm text-white">
                      2. Generate target assets
                    </strong>
                    <p className="mt-1 text-sm leading-6 text-[#b9aca0]">
                      Create posts, scripts, captions, newsletters, blogs, and
                      more from one source.
                    </p>
                  </article>

                  <article className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                    <strong className="text-sm text-white">
                      3. Keep everything organized
                    </strong>
                    <p className="mt-1 text-sm leading-6 text-[#b9aca0]">
                      Use the workspace as your content library instead of
                      losing outputs in chat.
                    </p>
                  </article>
                </div>
              </div>

              <AuthCard authSectionRef={authSectionRef} />
            </aside>
          </div>
        </section>

        <section id="product" className="py-20">
          <div className="mb-12 max-w-2xl text-left">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#d8a36f]">
              Product
            </p>
            <h2 className="max-w-[12ch] text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
              Turn one source into many assets.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#b9aca0]">
              Create platform-specific content from a single piece of source
              material while maintaining a consistent voice across channels.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8fb8b2]">
                Voice
              </span>
              <h3 className="mt-4 text-xl font-semibold text-white">
                Train the system on your style
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#b9aca0]">
                Save writing samples, transcripts, and references so generated
                content sounds more like you and less like generic AI.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8fb8b2]">
                Repurpose
              </span>
              <h3 className="mt-4 text-xl font-semibold text-white">
                Create content for every channel
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#b9aca0]">
                Generate LinkedIn posts, Twitter threads, newsletters, blogs,
                captions, scripts, and more from a single source.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-6">
              <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[#8fb8b2]">
                Workspace
              </span>
              <h3 className="mt-4 text-xl font-semibold text-white">
                Keep everything organized
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#b9aca0]">
                Store, edit, revisit, and improve generated assets without
                losing them across chats, documents, or disconnected tools.
              </p>
            </article>
          </div>
        </section>

        <section id="workflow" className="py-20">
          <div className="mb-12 max-w-2xl text-left">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#d8a36f]">
              Workflow
            </p>
            <h2 className="max-w-[12ch] text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
              A simple three-step workflow.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-[#b9aca0]">
              Go from source content to publishing-ready assets in minutes.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <article className="rounded-[1.5rem] border border-white/10 bg-[#151b25]/80 p-6">
              <span className="text-4xl font-semibold tracking-[-0.05em] text-[#d8a36f]">
                01
              </span>
              <h3 className="mt-6 text-xl font-semibold text-white">
                Add your source
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#b9aca0]">
                Paste a YouTube link, upload a transcript, or provide content
                you want to repurpose.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/10 bg-[#151b25]/80 p-6">
              <span className="text-4xl font-semibold tracking-[-0.05em] text-[#d8a36f]">
                02
              </span>
              <h3 className="mt-6 text-xl font-semibold text-white">
                Generate assets
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#b9aca0]">
                Select the formats you need and create multiple content pieces
                from a single source.
              </p>
            </article>

            <article className="rounded-[1.5rem] border border-white/10 bg-[#151b25]/80 p-6">
              <span className="text-4xl font-semibold tracking-[-0.05em] text-[#d8a36f]">
                03
              </span>
              <h3 className="mt-6 text-xl font-semibold text-white">
                Review and export
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#b9aca0]">
                Refine outputs, make edits, and keep everything organized inside
                your workspace.
              </p>
            </article>
          </div>
        </section>

        <section
          id="pricing"
          className="mb-10 grid gap-6 rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/[0.06] to-white/[0.025] p-6 sm:p-8 lg:grid-cols-[1fr_0.8fr] lg:p-10"
        >
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#d8a36f]">
              What&apos;s next
            </p>
            <h2 className="max-w-xl text-3xl font-semibold leading-[1.08] tracking-[-0.03em] text-white sm:text-5xl">
              One place to create and scale your content.
            </h2>
            <p className="mt-5 max-w-2xl text-base leading-7 text-[#b9aca0]">
              ContentOS is expanding with platform integrations, direct publishing,
              better AI generation quality, and more content formats to help creators
              turn every video into publish-ready assets for different platforms.
            </p>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-[#151b25]/80 p-6">
            <span className="inline-flex rounded-full border border-[#8fb8b2]/30 bg-[#8fb8b2]/10 px-3 py-1 text-xs font-medium text-[#b9d8d2]">
              Coming soon
            </span>

            <ul className="mt-5 space-y-3 text-sm leading-6 text-[#d8c7b5]">
              <li>Platform integrations with direct publishing</li>
              <li>Improved voice matching and generation quality</li>
              <li>More platform-specific content formats</li>
            </ul>

            <a
              className="mt-6 inline-flex rounded-full bg-[#d8a36f] px-6 py-3 text-sm font-semibold text-[#111820] shadow-lg shadow-[#d8a36f]/20 transition hover:-translate-y-0.5 hover:bg-[#e4b47f]"
              href="#auth"
              onClick={scrollToAuth}
            >
              Get started
            </a>
          </div>
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
