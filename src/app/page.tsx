import Link from "next/link";

function ShieldIcon() {
  return (
    <svg
      className="h-8 w-8 text-emerald-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
      />
    </svg>
  );
}

function SparkleIcon() {
  return (
    <svg
      className="h-8 w-8 text-emerald-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z"
      />
    </svg>
  );
}

function CodeBracketIcon() {
  return (
    <svg
      className="h-8 w-8 text-emerald-500"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5"
      />
    </svg>
  );
}

const valueProps = [
  {
    icon: <ShieldIcon />,
    title: "Privacy-first",
    description:
      "AES-256-GCM encryption before your data ever leaves your browser. Zero plaintext stored on our servers.",
  },
  {
    icon: <SparkleIcon />,
    title: "Free to start",
    description:
      "Track the last 3 months of income and expenses at no cost. Upgrade only when you need more history.",
  },
  {
    icon: <CodeBracketIcon />,
    title: "Open source",
    description:
      "Every line of code is public. Audit it, fork it, or self-host it — your data, your rules.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white dark:bg-gray-950">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 py-4 sm:px-10">
        <span className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
          LedgerLoop
        </span>
        <Link
          href="/api/auth/signin"
          className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
        >
          Sign in
        </Link>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero */}
        <section className="flex flex-1 flex-col items-center justify-center px-6 py-20 text-center sm:px-10 lg:py-32">
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
            Your finances.{" "}
            <span className="text-emerald-500">Your Drive.</span>
            <br className="hidden sm:block" /> Your control.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-gray-500 dark:text-gray-400 sm:text-lg">
            Your financial data is encrypted before it&apos;s stored in your
            Google Drive. LedgerLoop never persists your data on our servers.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/api/auth/signin"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 px-8 py-3.5 text-base font-semibold text-white shadow-md transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500 sm:w-auto"
            >
              Sign in with Google
            </Link>
            <Link
              href="/demo"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 sm:w-auto"
            >
              Try the demo
            </Link>
          </div>
        </section>

        {/* Value props */}
        <section className="border-t border-gray-100 bg-gray-50 px-6 py-16 dark:border-gray-800 dark:bg-gray-900 sm:px-10">
          <div className="mx-auto grid max-w-5xl gap-8 sm:grid-cols-3">
            {valueProps.map((vp) => (
              <div key={vp.title} className="flex flex-col items-start gap-4">
                {vp.icon}
                <div>
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                    {vp.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-500 dark:text-gray-400">
                    {vp.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-gray-400 dark:text-gray-600 sm:px-10">
        &copy; {new Date().getFullYear()} LedgerLoop. No tracking. No ads. No
        nonsense.
      </footer>
    </div>
  );
}
