import Link from "next/link";
import { APP_NAME } from "../../lib/appConstants";
import { BrandMark, Scene } from "../ui";

export default function LegalPageLayout({
  eyebrow,
  title,
  summary,
  effectiveDate,
  sections,
}) {
  return (
    <Scene maxWidth="max-w-4xl">
      <div className="rise mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/"
          className="inline-flex items-center gap-3 text-sm font-semibold text-ink/90 transition hover:text-white"
        >
          <BrandMark size="sm" />
          <span>{APP_NAME}</span>
        </Link>

        <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 p-1 text-sm text-muted">
          <Link
            className="rounded-full px-4 py-1.5 transition hover:bg-white/10 hover:text-white"
            href="/privacy"
          >
            Privacy
          </Link>
          <Link
            className="rounded-full px-4 py-1.5 transition hover:bg-white/10 hover:text-white"
            href="/terms"
          >
            Terms
          </Link>
          <Link
            className="rounded-full px-4 py-1.5 transition hover:bg-white/10 hover:text-white"
            href="/support"
          >
            Support
          </Link>
        </div>
      </div>

      <div className="rise" style={{ animationDelay: "80ms" }}>
        <section className="legal-card p-6 sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">{eyebrow}</p>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 text-base leading-8 text-muted sm:text-lg">
              {summary}
            </p>
            {effectiveDate ? (
              <p className="mt-4 text-sm text-muted">
                Effective date: {effectiveDate}
              </p>
            ) : null}
          </div>

          <div className="mt-10 space-y-5">
            {sections.map((section) => (
              <section
                key={section.title}
                className="legal-section p-5 sm:p-6"
              >
                <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base">
                  {section.paragraphs?.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                  {section.items?.length ? (
                    <ul className="space-y-2 text-ink/85">
                      {section.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </section>
            ))}
          </div>
        </section>
      </div>
    </Scene>
  );
}
