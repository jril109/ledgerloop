import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import type { DataFile } from "@/lib/schema";
import { loadDataFile } from "@/lib/server/loadDataFile";
import { AuthenticatedDashboard } from "@/components/dashboard/AuthenticatedDashboard";

const FREE_MONTHS = 3;

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function getAccessibleMonths(now: string): string[] {
  const [year, month] = now.split("-").map(Number);
  return Array.from({ length: FREE_MONTHS }, (_, i) => {
    const d = new Date(year, month - 1 - i, 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
}

function emptyDataFile(): DataFile {
  return {
    version: 1,
    householdName: "",
    people: [],
    months: {},
    preferences: {},
    tier: "free",
  };
}

function SignOutButton() {
  return (
    <form
      action={async () => {
        "use server";
        await signOut({ redirectTo: "/" });
      }}
    >
      <button
        type="submit"
        className="min-h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
      >
        Sign out
      </button>
    </form>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const result = await loadDataFile();

  if (result.status === "revoked") {
    await signOut({ redirectTo: "/sign-in?error=revoked" });
    redirect("/sign-in?error=revoked");
  }

  if (result.status === "error") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center dark:bg-gray-950">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-sm dark:bg-gray-900">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Could not load your data
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            {result.message}
          </p>
          <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
            >
              Try again
            </Link>
            <SignOutButton />
          </div>
        </div>
      </main>
    );
  }

  const initialData =
    result.status === "ok" ? result.data : emptyDataFile();

  const activeMonth = currentMonthKey();
  const availableMonths = getAccessibleMonths(activeMonth);

  return (
    <div className="relative bg-gray-50 dark:bg-gray-950">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
        <SignOutButton />
      </div>
      <AuthenticatedDashboard
        initialData={initialData}
        activeMonth={activeMonth}
        availableMonths={availableMonths}
      />
    </div>
  );
}
