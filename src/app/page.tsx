import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'LedgerLoop — Your finances, your Drive, your control',
  description:
    'Track income and expenses with complete privacy. Your data lives in your Google Drive, encrypted. LedgerLoop never stores it.',
};

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <header className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto w-full">
        <span className="text-base font-semibold tracking-tight">LedgerLoop</span>
        <a
          href="https://github.com/ledgerloop/ledgerloop"
          className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          GitHub
        </a>
      </header>

      <main className="flex flex-col items-center justify-center flex-1 px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto w-full">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight mb-6">
            Your finances.
            <br />
            Your Drive.
            <br />
            Your control.
          </h1>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto mb-10 leading-relaxed">
            Your financial data is encrypted before it&apos;s stored in your Google Drive.
            LedgerLoop never persists your data on our servers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="/sign-in"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
            >
              <GoogleIcon />
              Sign in with Google
            </a>
            <a
              href="/demo"
              className="inline-flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 px-6 py-3 text-sm font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition-colors"
            >
              Try the demo
            </a>
          </div>
        </div>
      </main>

      <section className="py-16 px-6 border-t border-zinc-100 dark:border-zinc-800">
        <div className="max-w-4xl mx-auto grid gap-10 sm:grid-cols-3">
          <ValueProp
            title="Privacy-first"
            description="Your data lives in your Google Drive, encrypted at rest. We never store it on our servers."
            icon={<LockIcon />}
          />
          <ValueProp
            title="Free to start"
            description="Track 3 months of income and expenses at no cost. No credit card required."
            icon={<SparkleIcon />}
          />
          <ValueProp
            title="Open source"
            description="Inspect every line. Fork it. Own it. Build on it."
            icon={<CodeIcon />}
          />
        </div>
      </section>

      <footer className="py-6 px-6 border-t border-zinc-100 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-600">
        No tracking. No analytics. No ads.
      </footer>
    </div>
  );
}

function ValueProp({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-emerald-600 dark:text-emerald-400">{icon}</div>
      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">{description}</p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="currentColor"
        opacity="0.9"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="currentColor"
        opacity="0.75"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="currentColor"
        opacity="0.6"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="currentColor"
        opacity="0.5"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}
