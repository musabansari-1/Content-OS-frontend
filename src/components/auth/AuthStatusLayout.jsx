import Link from "next/link";
import { APP_NAME } from "../../lib/appConstants";
import { BrandMark } from "../ui";

export default function AuthStatusLayout({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-ink">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-accent/20 blur-[90px]" />
        <div className="absolute bottom-[-140px] right-[-120px] h-[380px] w-[380px] rounded-full bg-accent-cool/15 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl items-center px-5 py-8 sm:px-8">
        <section className="w-full rounded-2xl border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <BrandMark size="md" />
            <div>
              <p className="text-base font-semibold tracking-tight text-white">{APP_NAME}</p>
              <p className="text-xs text-muted">AI content studio</p>
            </div>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-warning">
            {eyebrow}
          </p>
          <h1 className="max-w-[14ch] font-display text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted">{description}</p>

          <div className="mt-8">{children}</div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-[#0c1420] shadow-accent transition hover:-translate-y-0.5 hover:bg-accent-strong"
              href="/"
            >
              Back to home
            </Link>
            <Link
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-white/10"
              href="/#auth"
            >
              Open login
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
