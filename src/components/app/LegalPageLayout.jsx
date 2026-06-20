import Link from "next/link";
import { APP_NAME } from "../../lib/appConstants";

export default function LegalPageLayout({
  eyebrow,
  title,
  summary,
  effectiveDate,
  sections,
}) {
  return (
    <div className="min-h-screen bg-[#0f141c] text-[#f6efe7]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-[#c98f65]/20 blur-[90px]" />
        <div className="absolute bottom-[-140px] right-[-120px] h-[380px] w-[380px] rounded-full bg-[#8fb8b2]/16 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-medium text-[#d8c7b5] transition hover:text-white"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-[#d8a36f] to-[#8fb8b2] font-bold text-[#111820] shadow-lg shadow-[#d8a36f]/20">
              CB
            </span>
            <span>{APP_NAME}</span>
          </Link>

          <div className="flex items-center gap-4 text-sm text-[#b9aca0]">
            <Link className="transition hover:text-white" href="/privacy">
              Privacy
            </Link>
            <Link className="transition hover:text-white" href="/terms">
              Terms
            </Link>
            <Link className="transition hover:text-white" href="/support">
              Support
            </Link>
          </div>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#d8a36f]">
              {eyebrow}
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-base leading-8 text-[#c8beb4] sm:text-lg">
              {summary}
            </p>
            <p className="mt-4 text-sm text-[#9fb2bc]">Effective date: {effectiveDate}</p>
          </div>

          <div className="mt-10 space-y-8">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-[1.5rem] border border-white/8 bg-[#151b25]/72 p-5 sm:p-6"
              >
                <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-[#c8beb4] sm:text-base">
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.items?.length ? (
                    <ul className="space-y-2 pl-5 text-[#d8c7b5]">
                      {section.items.map((item) => (
                        <li key={item} className="list-disc">
                          {item}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
