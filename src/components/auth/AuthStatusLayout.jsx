import Link from "next/link";
import { APP_NAME } from "../../lib/appConstants";

export default function AuthStatusLayout({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0f141c] text-[#f6efe7]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-[#c98f65]/20 blur-[90px]" />
        <div className="absolute bottom-[-140px] right-[-120px] h-[380px] w-[380px] rounded-full bg-[#8fb8b2]/16 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-3xl items-center px-5 py-8 sm:px-8">
        <section className="w-full rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[#d8a36f] to-[#8fb8b2] font-bold text-[#111820] shadow-lg shadow-[#d8a36f]/20">
              CB
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-white">
                {APP_NAME}
              </p>
              <p className="text-xs text-[#b9aca0]">AI content studio</p>
            </div>
          </div>

          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#d8a36f]">
            {eyebrow}
          </p>
          <h1 className="max-w-[14ch] text-3xl font-semibold leading-[1.05] tracking-[-0.03em] text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-[#b9aca0]">
            {description}
          </p>

          <div className="mt-8">{children}</div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className="rounded-full bg-[#d8a36f] px-5 py-3 text-sm font-semibold text-[#111820] transition hover:-translate-y-0.5 hover:bg-[#e4b47f]"
              href="/"
            >
              Back to home
            </Link>
            <Link
              className="rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-[#f6efe7] transition hover:-translate-y-0.5 hover:bg-white/[0.07]"
              href="/"
            >
              Open login
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
