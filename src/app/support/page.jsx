import Link from "next/link";
import { APP_NAME, SUPPORT_EMAIL, SUPPORT_MAILTO } from "../../lib/appConstants";
import { buildSeoMetadata } from "../../lib/seo";
import { BrandMark } from "../../components/ui";

export const metadata = buildSeoMetadata({
  title: "Contact Support",
  description: `Get in touch with the ${APP_NAME} support team.`,
  path: "/support",
});

export default function SupportPage() {
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
          </div>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-panel backdrop-blur sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-warning">
              Contact Support
            </p>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Need help with your workspace?
            </h1>
            <p className="mt-5 text-base leading-8 text-muted sm:text-lg">
              Reach out if you need help with billing, account access, generation
              issues, integrations, or anything else inside the product.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-xl border border-white/10 bg-bg-elevated/80 p-5 sm:p-6">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
                Email support
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
                The fastest way to reach us is by email. Include your account email,
                a short description of the issue, and any useful screenshots or error
                details so we can help faster.
              </p>
              <a
                className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 text-sm font-semibold text-[#0c1420] shadow-accent transition hover:-translate-y-0.5 hover:bg-accent-strong"
                href={SUPPORT_MAILTO}
              >
                {SUPPORT_EMAIL}
              </a>
            </section>

            <section className="rounded-xl border border-white/10 bg-bg-elevated/80 p-5 sm:p-6">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
                Helpful details
              </h2>
              <ul className="mt-4 space-y-2 pl-5 text-sm leading-7 text-ink/80 sm:text-base">
                <li className="list-disc">Billing or checkout issue</li>
                <li className="list-disc">Login or account access issue</li>
                <li className="list-disc">Workspace or autosave issue</li>
                <li className="list-disc">Generation quality or output issue</li>
                <li className="list-disc">Publishing or integration issue</li>
              </ul>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
