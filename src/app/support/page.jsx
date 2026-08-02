import Link from "next/link";
import { APP_NAME, SUPPORT_EMAIL, SUPPORT_MAILTO } from "../../lib/appConstants";
import { buildSeoMetadata } from "../../lib/seo";
import { BrandMark, Scene } from "../../components/ui";

export const metadata = buildSeoMetadata({
  title: "Contact Support",
  description: `Get in touch with the ${APP_NAME} support team.`,
  path: "/support",
});

export default function SupportPage() {
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
        </div>
      </div>

      <div className="rise" style={{ animationDelay: "80ms" }}>
        <section className="legal-card p-6 sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="eyebrow mb-4">Contact Support</p>
            <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
              Need help with your workspace?
            </h1>
            <p className="mt-5 text-base leading-8 text-muted sm:text-lg">
              Reach out if you need help with billing, account access, generation
              issues, integrations, or anything else inside the product.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-[1.15fr_0.85fr]">
            <section className="legal-section p-5 sm:p-6">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
                Email support
              </h2>
              <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
                The fastest way to reach us is by email. Include your account email,
                a short description of the issue, and any useful screenshots or error
                details so we can help faster.
              </p>
              <a
                className="ui-btn ui-btn-primary ui-btn-md ui-btn-pill mt-6"
                href={SUPPORT_MAILTO}
              >
                {SUPPORT_EMAIL}
              </a>
            </section>

            <section className="legal-section p-5 sm:p-6">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-white">
                Helpful details
              </h2>
              <ul className="mt-4 space-y-2 text-sm leading-7 text-ink/85 sm:text-base">
                <li>Billing or checkout issue</li>
                <li>Login or account access issue</li>
                <li>Workspace or autosave issue</li>
                <li>Generation quality or output issue</li>
                <li>Publishing or integration issue</li>
              </ul>
            </section>
          </div>
        </section>
      </div>
    </Scene>
  );
}
