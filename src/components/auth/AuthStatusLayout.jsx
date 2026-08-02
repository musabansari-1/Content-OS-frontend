import Link from "next/link";
import { APP_NAME } from "../../lib/appConstants";
import { BrandMark, Scene } from "../ui";

export default function AuthStatusLayout({
  eyebrow,
  title,
  description,
  children,
}) {
  return (
    <Scene maxWidth="max-w-3xl">
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center py-4">
        <div className="rise w-full" style={{ animationDelay: "60ms" }}>
          <section className="auth-card p-6 sm:p-8">
            <div className="mb-8 flex items-center gap-3">
              <BrandMark size="md" />
              <div>
                <p className="text-base font-semibold tracking-tight text-white">
                  {APP_NAME}
                </p>
                <p className="text-xs text-muted">One video. Every asset.</p>
              </div>
            </div>

            <p className="eyebrow mb-3">{eyebrow}</p>
            <h1 className="max-w-[14ch] font-display text-3xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl">
              {title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted">
              {description}
            </p>

            <div className="mt-8">{children}</div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                className="ui-btn ui-btn-primary ui-btn-md ui-btn-pill"
                href="/"
              >
                Back to home
              </Link>
              <Link
                className="ui-btn ui-btn-ghost ui-btn-md ui-btn-pill"
                href="/#auth"
              >
                Open login
              </Link>
            </div>
          </section>
        </div>
      </div>
    </Scene>
  );
}
