"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { GenerationLoader } from "./WorkspacePage";
import { useAppState } from "./AppProvider";
import { APP_NAME, GOOGLE_CLIENT_ID } from "../../lib/appConstants";

function InlineInfoIcon({ className = "h-4 w-4" }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 20 20"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 8.35V13"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <circle cx="10" cy="6.1" fill="currentColor" r="1" />
    </svg>
  );
}

function AuthNotice({
  message,
  kind = "info",
  actionUrl = "",
  actionLabel = "",
}) {
  if (!message) {
    return null;
  }

  const toneClasses = {
    info: "border-sky-400/25 bg-sky-400/10 text-sky-50",
    success: "border-emerald-400/25 bg-emerald-400/10 text-emerald-50",
    warning: "border-amber-300/30 bg-amber-300/10 text-amber-50",
    error: "border-rose-400/25 bg-rose-400/10 text-rose-50",
  };

  return (
    <div
      className={[
        "rounded-3xl border px-4 py-3 text-sm leading-6 shadow-[0_18px_60px_rgba(0,0,0,0.18)]",
        toneClasses[kind] || toneClasses.info,
      ].join(" ")}
    >
      <p className="m-0">{message}</p>
      {actionUrl && actionLabel ? (
        <a
          className="mt-2 inline-flex text-sm font-semibold text-white underline decoration-white/35 underline-offset-4 transition hover:decoration-white"
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

function GoogleSignInButton({ authMode, authConsentAccepted }) {
  const {
    googleAuthStatus,
    googleAuthError,
    handleGoogleSignIn,
  } = useAppState();
  const buttonRef = useRef(null);
  const callbackRef = useRef(handleGoogleSignIn);
  const [scriptError, setScriptError] = useState("");
  const shouldShowGoogle = Boolean(GOOGLE_CLIENT_ID) && authMode !== "forgot";
  const consentRequired = authMode === "register" && !authConsentAccepted;

  useEffect(() => {
    callbackRef.current = handleGoogleSignIn;
  }, [handleGoogleSignIn]);

  useEffect(() => {
    if (!shouldShowGoogle) {
      return undefined;
    }

    let cancelled = false;
    let script = null;

    const renderButton = () => {
      if (cancelled || !buttonRef.current || !window.google?.accounts?.id) {
        return;
      }

      setScriptError("");
      buttonRef.current.innerHTML = "";
      const buttonWidth = Math.min(
        Math.max(Math.round(buttonRef.current.getBoundingClientRect().width || 320), 240),
        360,
      );
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: ({ credential }) => {
          callbackRef.current(credential || "");
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        shape: "pill",
        text: "continue_with",
        width: buttonWidth,
      });
    };

    if (window.google?.accounts?.id) {
      renderButton();
      return () => {
        cancelled = true;
      };
    }

    script = document.querySelector('script[data-google-identity="true"]');
    const handleLoad = () => {
      renderButton();
    };
    const handleError = () => {
      if (!cancelled) {
        setScriptError("Google sign-in is unavailable right now. Try email login instead.");
      }
    };

    if (!script) {
      script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.dataset.googleIdentity = "true";
      document.head.appendChild(script);
    }

    script.addEventListener("load", handleLoad);
    script.addEventListener("error", handleError);

    return () => {
      cancelled = true;
      script?.removeEventListener("load", handleLoad);
      script?.removeEventListener("error", handleError);
    };
  }, [shouldShowGoogle]);

  if (!shouldShowGoogle) {
    return null;
  }

  return (
    <div className="grid gap-3">
      <div
        className={[
          "transition",
          consentRequired ? "pointer-events-none opacity-45 saturate-0" : "",
        ].join(" ")}
      >
        <div
          className="flex min-h-[44px] justify-center [&>div]:!w-full [&_iframe]:mx-auto"
          ref={buttonRef}
        />
      </div>
      {consentRequired ? (
        <p className="m-0 inline-flex items-center gap-2 text-sm text-[#9aa6b8]">
          <InlineInfoIcon className="h-4 w-4 shrink-0 text-[#f2a666]" />
          Agree to the terms below to continue with Google.
        </p>
      ) : null}
      {googleAuthStatus === "loading" ? (
        <p className="m-0 text-sm text-[#9aa6b8]">Signing in with Google...</p>
      ) : null}
      {scriptError ? <p className="m-0 text-sm text-rose-300">{scriptError}</p> : null}
      {googleAuthError ? <p className="m-0 text-sm text-rose-300">{googleAuthError}</p> : null}
    </div>
  );
}

function AuthCard({ authSectionRef }) {
  const {
    authMode,
    setAuthMode,
    authForm,
    authConsentAccepted,
    authStatus,
    authError,
    authMessage,
    authMessageKind,
    authActionUrl,
    authActionLabel,
    handleAuthConsentChange,
    handleAuthChange,
    handleAuthSubmit,
  } = useAppState();
  const isForgotMode = authMode === "forgot";
  const isRegisterMode = authMode === "register";
  const isConsentBlocked = isRegisterMode && !authConsentAccepted;
  const isSubmitLoading = authStatus === "loading";
  const toggleBaseClasses =
    "rounded-full px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]/40";
  const fieldClasses =
    "w-full rounded-2xl border border-white/10 bg-[#101a28] px-4 py-3 text-sm text-white placeholder:text-[#718096] focus:border-[#ff8a3d]/45 focus:outline-none focus:ring-2 focus:ring-[#ff8a3d]/20";
  const submitButtonClasses = [
    "mt-2 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition",
    isConsentBlocked
      ? "cursor-not-allowed border border-white/10 bg-white/8 text-[#8d9ab0] shadow-none"
      : "bg-[#ff8a3d] text-[#0c1420] shadow-[0_18px_40px_rgba(255,138,61,0.28)] hover:-translate-y-0.5 hover:bg-[#ff9e59]",
    isSubmitLoading ? "cursor-wait opacity-70" : "",
  ].join(" ");

  return (
    <section
      className="rounded-[2rem] border border-white/10 bg-[#08131f]/92 p-6 text-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur"
      id="auth"
      ref={authSectionRef}
    >
      <div className="mb-6">
        <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f2a666]">
          Start now
        </p>
        <h2 className="m-0 text-[1.9rem] font-semibold tracking-tight text-white">
          {isForgotMode
            ? "Reset your password"
            : authMode === "login"
              ? "Welcome back"
              : "Create your content workspace"}
        </h2>
        <p className="mt-3 text-sm leading-7 text-[#9aa6b8]">
          {isForgotMode
            ? "Enter your email and we will send you a secure reset link."
            : authMode === "login"
            ? "Sign in to keep generating, editing, scheduling, and publishing from the same workspace."
            : "Sign up to save your voice profile, keep every generated asset in one place, and unlock billing and publishing when you are ready."}
        </p>
      </div>

      {!isForgotMode ? (
        <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          <button
            className={[
              toggleBaseClasses,
              authMode === "login"
                ? "bg-white text-[#0c1420] shadow-sm"
                : "text-[#9aa6b8] hover:text-white",
            ].join(" ")}
            onClick={() => setAuthMode("login")}
            type="button"
          >
            Log in
          </button>
          <button
            className={[
              toggleBaseClasses,
              authMode === "register"
                ? "bg-[#ff8a3d] text-[#0c1420] shadow-[0_12px_28px_rgba(255,138,61,0.25)]"
                : "text-[#9aa6b8] hover:text-white",
            ].join(" ")}
            onClick={() => setAuthMode("register")}
            type="button"
          >
            Sign up
          </button>
        </div>
      ) : null}

      {isForgotMode ? (
        <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-[#c9d2df]">
          Password reset
        </div>
      ) : null}

      <form className="mt-5 flex flex-col gap-4" onSubmit={handleAuthSubmit}>
        {isRegisterMode ? (
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#d7deea]">Display name</span>
            <input
              className={fieldClasses}
              type="text"
              placeholder="Aman"
              value={authForm.displayName}
              onChange={(event) => handleAuthChange("displayName", event.target.value)}
            />
          </label>
        ) : null}
        <label className="flex flex-col gap-2">
          <span className="text-sm font-medium text-[#d7deea]">Email</span>
          <input
            className={fieldClasses}
            type="email"
            placeholder="you@example.com"
            value={authForm.email}
            onChange={(event) => handleAuthChange("email", event.target.value)}
          />
        </label>
        {!isForgotMode ? (
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-[#d7deea]">Password</span>
            <input
              className={fieldClasses}
              type="password"
              placeholder="At least 8 characters"
              value={authForm.password}
              onChange={(event) => handleAuthChange("password", event.target.value)}
            />
          </label>
        ) : null}
        {isRegisterMode ? (
          <label className="flex items-start gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-3 text-sm leading-6 text-[#d7deea]">
            <input
              checked={authConsentAccepted}
              className="mt-1 h-4 w-4 shrink-0 rounded border-white/20 bg-[#101a28] accent-[#ff8a3d]"
              onChange={(event) => handleAuthConsentChange(event.target.checked)}
              type="checkbox"
            />
            <span>
              I agree to the{" "}
              <Link
                className="font-semibold text-[#f2a666] underline decoration-[#f2a666]/35 underline-offset-4 transition hover:text-[#ffd2ad] hover:decoration-[#ffd2ad]"
                href="/terms"
                rel="noreferrer"
                target="_blank"
              >
                Terms of Service
              </Link>{" "}
              and acknowledge that I have read the{" "}
              <Link
                className="font-semibold text-[#f2a666] underline decoration-[#f2a666]/35 underline-offset-4 transition hover:text-[#ffd2ad] hover:decoration-[#ffd2ad]"
                href="/privacy"
                rel="noreferrer"
                target="_blank"
              >
                Privacy Policy
              </Link>
              .
            </span>
          </label>
        ) : null}
        <button
          className={submitButtonClasses}
          type="submit"
          disabled={isSubmitLoading || isConsentBlocked}
        >
          {isSubmitLoading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#0c1420]/25 border-t-[#0c1420]" />
              <span>
                {isForgotMode
                  ? "Sending reset link..."
                  : authMode === "login"
                    ? "Signing in..."
                    : "Creating account..."}
              </span>
            </>
          ) : isConsentBlocked ? (
            <>
              <InlineInfoIcon className="h-4 w-4 text-[#f2a666]" />
              <span>Agree to continue</span>
            </>
          ) : (
            <span>
              {isForgotMode
                ? "Send reset link"
                : authMode === "login"
                  ? "Log in"
                  : "Create account"}
            </span>
          )}
        </button>
        {isConsentBlocked ? (
          <p className="m-0 inline-flex items-center gap-2 text-sm text-[#8d9ab0]">
            <InlineInfoIcon className="h-4 w-4 shrink-0 text-[#f2a666]" />
            Agree to the terms to create your account.
          </p>
        ) : null}
      </form>

      {!isForgotMode ? (
        <div className="my-5 flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#74839a]">
          <span className="h-px flex-1 bg-white/10" />
          <span>{isRegisterMode ? "Or sign up with Google" : "Or continue with Google"}</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>
      ) : null}

      <GoogleSignInButton
        authConsentAccepted={authConsentAccepted}
        authMode={authMode}
      />

      <div className="mt-4 flex justify-end">
        <button
          className="text-sm font-semibold text-[#f2a666] transition hover:text-[#ffd2ad]"
          onClick={() => setAuthMode(isForgotMode ? "login" : "forgot")}
          type="button"
        >
          {isForgotMode ? "Back to login" : "Forgot password?"}
        </button>
      </div>

      <div className="mt-5 space-y-3">
        <AuthNotice
          actionLabel={authActionLabel}
          actionUrl={authActionUrl}
          kind={authMessageKind}
          message={authMessage}
        />
        {authError ? <p className="m-0 text-sm text-rose-300">{authError}</p> : null}
      </div>
    </section>
  );
}

function AuthScreen() {
  const authSectionRef = useRef(null);
  const currentYear = new Date().getFullYear();
  const productPillars = [
    {
      kicker: "Voice",
      title: "Save a reusable voice profile",
      copy:
        "Build it from writing samples, pasted transcripts, or YouTube sources, then reuse that profile across new generations.",
    },
    {
      kicker: "Inputs",
      title: "Start from video, YouTube, or transcript",
      copy:
        "Use a YouTube URL, upload a video, or paste a transcript when a source cannot be fetched automatically.",
    },
    {
      kicker: "Assets",
      title: "Generate a content pack",
      copy:
        "Select the asset types you need and add every result to a saved workspace instead of overwriting old outputs.",
    },
    {
      kicker: "Workspace",
      title: "Edit, organize, and export",
      copy:
        "Open generated assets, edit individual blocks, move work through Draft, Ready, and Published lanes, and export the workspace.",
    },
    {
      kicker: "Planning",
      title: "Plan a five-week rollout",
      copy:
        "Review scheduled posts, save draft rollouts, and bulk schedule ready assets from a generation batch.",
    },
    {
      kicker: "Publishing",
      title: "Publish where the app is wired",
      copy:
        "Connect platforms from the integrations screen and publish supported assets to destinations such as LinkedIn, Instagram, and Ghost.",
    },
  ];
  const workflowSteps = [
    {
      step: "01",
      title: "Capture your style",
      copy: "Save examples once so future assets have a clearer voice direction.",
    },
    {
      step: "02",
      title: "Add the source",
      copy: "Paste a YouTube link, upload a video, or provide the transcript directly.",
    },
    {
      step: "03",
      title: "Generate the pack",
      copy: "Choose the target assets and let the job build a reusable batch.",
    },
    {
      step: "04",
      title: "Review and ship",
      copy: "Edit, mark ready, schedule, publish, download video clips, or export the work.",
    },
  ];

  const scrollToAuth = (event) => {
    event.preventDefault();
    authSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  return (
    <div className="relative min-h-screen bg-[#0f141c] text-[#f6efe7]">
      <main className="relative z-10 mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:px-10">
        <header className="sticky top-4 z-30 flex flex-col gap-4 rounded-[1.6rem] border border-white/10 bg-[#08111c]/82 px-4 py-4 backdrop-blur xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#d8a36f] to-[#8fb8b2] font-bold text-[#111820] shadow-lg shadow-[#d8a36f]/20">
              CB
            </div>

            <div className="flex flex-col">
              <span className="text-base font-semibold tracking-tight">
                {APP_NAME}
              </span>
              <span className="text-xs text-[#b9aca0]">
                AI content studio
              </span>
            </div>
          </div>

          <nav className="flex flex-wrap items-center gap-2 rounded-[1.2rem] border border-white/8 bg-white/4 p-2 text-sm text-[#c8beb4]">
            <a
              className="rounded-full px-4 py-2 font-medium transition hover:bg-white/8 hover:text-white"
              href="#features"
            >
              Features
            </a>
            <a
              className="rounded-full px-4 py-2 font-medium transition hover:bg-white/8 hover:text-white"
              href="#workflow"
            >
              Workflow
            </a>
            <a
              className="rounded-full px-4 py-2 font-medium transition hover:bg-white/8 hover:text-white"
              href="#publishing"
            >
              Publishing
            </a>
            <a
              className="rounded-full px-4 py-2 font-medium transition hover:bg-white/8 hover:text-white"
              href="#plans"
            >
              Plans
            </a>
            <Link
              className="rounded-full px-4 py-2 font-medium transition hover:bg-white/8 hover:text-white"
              href="/privacy"
            >
              Privacy
            </Link>
            <Link
              className="rounded-full px-4 py-2 font-medium transition hover:bg-white/8 hover:text-white"
              href="/terms"
            >
              Terms
            </Link>
            <Link
              className="rounded-full px-4 py-2 font-medium transition hover:bg-white/8 hover:text-white"
              href="/support"
            >
              Contact Support
            </Link>
            <a
              className="rounded-full bg-[#ff8a3d] px-4 py-2 font-semibold text-[#0b1320] transition hover:bg-[#ff9e59]"
              href="#auth"
              onClick={scrollToAuth}
            >
              Log in
            </a>
          </nav>
        </header>

        <div className="mt-6 space-y-6">
          <section
            id="product"
            className="overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(255,255,255,0.02)),radial-gradient(circle_at_top_left,rgba(255,138,61,0.18),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(86,178,156,0.14),transparent_30%),linear-gradient(180deg,#08131f,#0a111b)] p-5 shadow-[0_34px_120px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10"
          >
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
              <div className="grid gap-8">
                <div className="grid gap-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#f2a666]">
                    For creators, consultants, and lean teams
                  </p>
                  <h1 className="max-w-[11ch] font-['Space_Grotesk'] text-[clamp(2.8rem,6vw,5rem)] font-bold leading-[0.94] tracking-tight text-white">
                    Create weeks of content from one strong source.
                  </h1>
                  <p className="max-w-3xl text-base leading-8 text-[#d8e0ea] sm:text-lg">
                    {APP_NAME} helps you save your voice, turn videos and transcripts
                    into platform-specific drafts, edit everything in one workspace,
                    plan the next five weeks, and publish to the channels already
                    supported in the product.
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <a
                    className="inline-flex h-11 items-center justify-center rounded-xl bg-[#ff8a3d] px-5 text-sm font-semibold leading-none text-[#0b1320] shadow-[0_18px_40px_rgba(255,138,61,0.28)] transition hover:-translate-y-0.5 hover:bg-[#ff9e59]"
                    href="#auth"
                    onClick={scrollToAuth}
                  >
                    Start free
                  </a>
                  <a
                    className="inline-flex h-11 items-center justify-center rounded-xl border border-white/12 bg-white/5 px-5 text-sm font-semibold leading-none text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                    href="#workflow"
                  >
                    See how it works
                  </a>
                </div>

                <div className="flex flex-wrap gap-3">
                  {[
                    "Saved voice profile",
                    "Editable workspace",
                    "Bulk scheduling",
                    "Billing-ready accounts",
                  ].map((item) => (
                    <span
                      key={item}
                      className="inline-flex h-9 items-center justify-center rounded-full border border-white/10 bg-white/6 px-4 text-sm font-medium leading-none text-[#e4ecf6]"
                    >
                      {item}
                    </span>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-white/10 bg-[#09131f]/80 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fc8b9]">
                      Why sign up
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#d5ddea]">
                      Your drafts, voice profile, workspace edits, publishing setup,
                      and billing history stay attached to the same account.
                    </p>
                  </div>
                  <div className="rounded-[1.5rem] border border-white/10 bg-[#09131f]/80 p-5">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#8fc8b9]">
                      Source flexibility
                    </p>
                    <p className="mt-3 text-sm leading-7 text-[#d5ddea]">
                      Start with a YouTube link, an uploaded video, or a pasted
                      transcript when you just need to get moving.
                    </p>
                  </div>
                </div>
              </div>

              <aside className="grid gap-5">
                <div className="rounded-[2rem] border border-white/10 bg-[#08111c]/92 p-6 shadow-[0_26px_80px_rgba(0,0,0,0.35)]">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f2a666]">
                        Inside the product
                      </p>
                      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                        One source, one workspace, many outputs
                      </h2>
                    </div>
                    <span className="inline-flex rounded-full border border-[#8fc8b9]/25 bg-[#8fc8b9]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#cdeee7]">
                      Available now
                    </span>
                  </div>

                  <div className="mt-5 grid gap-3">
                    <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9eacc0]">
                        Voice profile
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#eef3f8]">
                        Save samples, YouTube sources, or transcripts once and reuse
                        that voice on future generations.
                      </p>
                    </div>

                    <div className="rounded-[1.4rem] border border-white/8 bg-white/5 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9eacc0]">
                        Output types
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {["LinkedIn posts", "Instagram carousels", "Blog posts", "Newsletters", "Short clips"].map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-[#8fc8b9]/20 bg-[#8fc8b9]/8 px-3 py-1.5 text-xs font-medium text-[#d5efe9]"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      {[
                        ["Draft", "Edit and refine"],
                        ["Ready", "Move approved work forward"],
                        ["Scheduled", "Plan upcoming publishes"],
                      ].map(([title, copy]) => (
                        <div
                          key={title}
                          className="rounded-[1.25rem] border border-white/8 bg-[#0d1825] p-4"
                        >
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9eacc0]">
                            {title}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-[#eef3f8]">{copy}</p>
                        </div>
                      ))}
                    </div>

                    <div className="rounded-[1.4rem] border border-amber-200/15 bg-amber-200/8 p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ffd7b4]">
                        Publishing truth
                      </p>
                      <p className="mt-2 text-sm leading-6 text-[#f7ede3]">
                        Direct publish is currently wired for supported assets on
                        LinkedIn, Instagram, and Ghost. Some integrations are still
                        marked coming soon.
                      </p>
                    </div>
                  </div>
                </div>

                <AuthCard authSectionRef={authSectionRef} />
              </aside>
            </div>
          </section>

          <section
            id="features"
            className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),#08111b] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:p-8"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f2a666]">
                  Features
                </p>
                <h2 className="mt-2 max-w-[12ch] font-['Space_Grotesk'] text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1] tracking-tight text-white">
                  Everything that keeps content moving after signup.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-[#9aa6b8] sm:text-base">
                Every card below maps to product behavior that already exists in the
                app today, so new visitors get a strong pitch without false promises.
              </p>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {productPillars.map((feature) => (
                <article
                  className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02)),#0b1521] p-5"
                  key={feature.title}
                >
                  <span className="inline-flex rounded-full border border-[#f2a666]/20 bg-[#f2a666]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ffd7b4]">
                    {feature.kicker}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#9aa6b8]">
                    {feature.copy}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <section
            id="workflow"
            className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)),#08111b] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:p-8"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f2a666]">
                  Workflow
                </p>
                <h2 className="mt-2 max-w-[13ch] font-['Space_Grotesk'] text-[clamp(2rem,4vw,3.4rem)] font-bold leading-[1] tracking-tight text-white">
                  Sign up once. Stop rebuilding your content process every time.
                </h2>
              </div>
              <p className="max-w-2xl text-sm leading-7 text-[#9aa6b8] sm:text-base">
                The app is structured around a simple sequence: save your voice,
                generate assets, refine them in a workspace, and move into scheduling
                or publishing from there.
              </p>
            </div>

            <div className="mt-8 grid gap-4 xl:grid-cols-4">
              {workflowSteps.map((step) => (
                <article
                  className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.02)),#0b1521] p-5"
                  key={step.step}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8fc8b9]">
                    Step {step.step}
                  </span>
                  <h3 className="mt-4 text-xl font-semibold tracking-tight text-white">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#9aa6b8]">
                    {step.copy}
                  </p>
                </article>
              ))}
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section
              id="publishing"
              className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)),#08111b] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:p-8"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f2a666]">
                Publishing
              </p>
              <h2 className="mt-2 max-w-[12ch] font-['Space_Grotesk'] text-[clamp(2rem,4vw,3rem)] font-bold leading-[1] tracking-tight text-white">
                Connect the channels you already use.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#9aa6b8] sm:text-base">
                After signup, you can connect supported platforms in the integrations
                area and publish supported assets from the workspace when you are ready.
              </p>

              <div className="mt-6 grid gap-3">
                <div className="rounded-[1.4rem] border border-emerald-300/15 bg-emerald-300/8 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c9f4e5]">
                    Wired today
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#ecfff8]">
                    LinkedIn, Instagram, and Ghost publishing are already part of the
                    workspace flow for supported asset types.
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-sky-300/15 bg-sky-300/8 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#d7efff]">
                    Connection flow available
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#edf7ff]">
                    X is present in integrations today, even though the strongest
                    publish path in the workspace is still centered on the supported
                    asset destinations above.
                  </p>
                </div>
                <div className="rounded-[1.4rem] border border-amber-200/15 bg-amber-200/8 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#ffd7b4]">
                    Still coming soon
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[#f7ede3]">
                    TikTok, Medium, Substack, Notion, and YouTube publishing should be
                    treated as future-facing until those cards stop saying coming soon.
                  </p>
                </div>
              </div>
            </section>

            <section
              id="plans"
              className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02)),#08111b] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.28)] sm:p-8"
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-[#f2a666]">
                Plans and account
              </p>
              <h2 className="mt-2 max-w-[12ch] font-['Space_Grotesk'] text-[clamp(2rem,4vw,3rem)] font-bold leading-[1] tracking-tight text-white">
                Sign up now and grow into the rest of the product.
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#9aa6b8] sm:text-base">
                Accounts are already set up for email or Google sign-in, email
                verification, saved workspaces, billing usage, and plan upgrades from
                inside the app.
              </p>

              <div className="mt-6 space-y-3">
                {[
                  "Create an account with email or Google.",
                  "Verify your email before high-trust actions like billing and publishing.",
                  "Keep your voice profile, drafts, schedules, and account history together.",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.25rem] border border-white/8 bg-white/5 px-4 py-3 text-sm leading-6 text-[#e4ecf6]"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <a
                className="mt-6 inline-flex items-center justify-center rounded-full bg-[#ff8a3d] px-6 py-3 text-sm font-semibold text-[#0b1320] shadow-[0_18px_40px_rgba(255,138,61,0.28)] transition hover:-translate-y-0.5 hover:bg-[#ff9e59]"
                href="#auth"
                onClick={scrollToAuth}
              >
                Create your account
              </a>
            </section>
          </div>
        </div>

        <footer className="mt-12 grid gap-6 rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.015)),#07101a] px-6 py-8 text-sm text-[#9aa6b8] shadow-[0_24px_70px_rgba(0,0,0,0.25)] sm:px-8 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
          <div className="flex items-start gap-4">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#ff8a3d] to-[#8fc8b9] font-bold text-[#09111b]">
              CB
            </div>
            <div>
              <p className="m-0 text-base font-semibold text-white">{APP_NAME}</p>
              <p className="mt-2 max-w-xl leading-6">
                Create from source material, keep your drafts organized, and move
                toward publishing from one account.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 text-white/85">
            <Link className="transition hover:text-white" href="/privacy">
              Privacy Policy
            </Link>
            <Link className="transition hover:text-white" href="/terms">
              Terms of Service
            </Link>
            <Link className="transition hover:text-white" href="/support">
              Contact Support
            </Link>
          </div>

          <div className="text-sm leading-6 lg:text-right">
            <p className="m-0">&copy; {currentYear} {APP_NAME}. All rights reserved.</p>
            <p className="mt-1">Built for creators, teams, and distribution-first workflows.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default function AppFrame({ route, children }) {
  const {
    bootStatus,
    token,
    user,
    billingSummary,
    handleLogout,
    generateStatus,
    generateJob,
    selectedAssets,
    targetAssets,
    authMessage,
    authMessageKind,
    authActionUrl,
    authActionLabel,
    verificationStatus,
    handleResendVerification,
  } = useAppState();
  const showVerificationBanner = Boolean(user && !user.email_verified);

  if (bootStatus === "loading") {
    return (
      <div className="app-shell">
        <main className="app app-loading">
          <div className="panel boot-panel">
            <p className="eyebrow">{APP_NAME}</p>
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
            <div className="brand-mark">CB</div>
            <div className="brand-text">
              <span className="brand-name">{APP_NAME}</span>
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
              className={`nav-btn ${route === "calendar" ? "active" : ""}`}
              href="/calendar"
            >
              Calendar
            </Link>
            <Link
              className={`nav-btn ${route === "integrations" ? "active" : ""}`}
              href="/integrations"
            >
              Integrations
            </Link>
            <Link
              className={`nav-btn ${route === "billing" ? "active" : ""}`}
              href="/billing"
            >
              Billing
            </Link>
          </nav>
          <div className="header-right">
            {billingSummary ? (
              <div className="plan-pill">
                <span className="plan-pill-label">Plan</span>
                <strong>{billingSummary.plan_label}</strong>
              </div>
            ) : null}
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

        {showVerificationBanner ? (
          <section className="auth-banner auth-banner-warning">
            <div>
              <p className="eyebrow">Email verification</p>
              <h2>Verify your email to unlock publishing and billing</h2>
              <p className="muted-copy">
                {authMessage || "Check your inbox for the verification link, or resend it from here."}
              </p>
            </div>
            <div className="auth-banner-actions">
              <button
                className="primary-button"
                disabled={verificationStatus === "loading"}
                onClick={handleResendVerification}
                type="button"
              >
                {verificationStatus === "loading" ? "Sending..." : "Resend verification email"}
              </button>
              {authActionUrl && authActionLabel ? (
                <a
                  className="ghost-button"
                  href={authActionUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {authActionLabel}
                </a>
              ) : null}
            </div>
          </section>
        ) : authMessage ? (
          <AuthNotice
            actionLabel={authActionLabel}
            actionUrl={authActionUrl}
            kind={authMessageKind}
            message={authMessage}
          />
        ) : null}

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
