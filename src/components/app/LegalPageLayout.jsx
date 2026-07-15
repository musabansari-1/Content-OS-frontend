import Link from "next/link";
import { APP_NAME } from "../../lib/appConstants";
import { BrandMark } from "../ui";

export default function LegalPageLayout({
  eyebrow,
  title,
  summary,
  effectiveDate,
  sections,
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-bg text-ink">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-120px] h-[360px] w-[360px] rounded-full bg-accent/20 blur-[90px]" />
        <div className="absolute bottom-[-140px] right-[-120px] h-[380px] w-[380px] rounded-full bg-accent-cool/15 blur-[100px]" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-4xl px-5 py-8 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 text-sm font-medium text-ink/90 transition hover:text-white"
          >
            <BrandMark size="sm" />
            <span>{APP_NAME}</span>
          </Link>

          <div className="flex items-center gap-4 text-sm text-muted">
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

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-warning">
              {eyebrow}
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-base leading-8 text-muted sm:text-lg">{summary}</p>
            {effectiveDate ? (
              <p className="mt-4 text-sm text-muted">Effective date: {effectiveDate}</p>
            ) : null}
          </div>

          <div className="mt-10 space-y-6">
            {sections.map((section) => (
              <section
                key={section.title}
                className="rounded-xl border border-white/10 bg-bg-elevated/80 p-5 sm:p-6"
              >
                <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base">
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.items?.length ? (
                    <ul className="space-y-2 pl-5 text-ink/80">
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
