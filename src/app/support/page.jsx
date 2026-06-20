import Link from "next/link";
import { APP_NAME, SUPPORT_EMAIL, SUPPORT_MAILTO } from "../../lib/appConstants";

export const metadata = {
  title: `Contact Support | ${APP_NAME}`,
  description: `Get in touch with the ${APP_NAME} support team.`,
};

export default function SupportPage() {
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
          </div>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur sm:p-8 lg:p-10">
          <div className="max-w-3xl">
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-[#d8a36f]">
              Contact Support
            </p>
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl">
              Need help with your workspace?
            </h1>
            <p className="mt-5 text-base leading-8 text-[#c8beb4] sm:text-lg">
              Reach out if you need help with billing, account access, generation
              issues, integrations, or anything else inside the product.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-[1.15fr_0.85fr]">
            <section className="rounded-[1.5rem] border border-white/8 bg-[#151b25]/72 p-5 sm:p-6">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                Email support
              </h2>
              <p className="mt-4 text-sm leading-7 text-[#c8beb4] sm:text-base">
                The fastest way to reach us is by email. Include your account email,
                a short description of the issue, and any useful screenshots or error
                details so we can help faster.
              </p>
              <a
                className="mt-6 inline-flex rounded-full bg-[#d8a36f] px-6 py-3 text-sm font-semibold text-[#111820] shadow-lg shadow-[#d8a36f]/20 transition hover:-translate-y-0.5 hover:bg-[#e4b47f]"
                href={SUPPORT_MAILTO}
              >
                {SUPPORT_EMAIL}
              </a>
            </section>

            <section className="rounded-[1.5rem] border border-white/8 bg-[#151b25]/72 p-5 sm:p-6">
              <h2 className="text-2xl font-semibold tracking-[-0.03em] text-white">
                Helpful details
              </h2>
              <ul className="mt-4 space-y-2 pl-5 text-sm leading-7 text-[#d8c7b5] sm:text-base">
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
