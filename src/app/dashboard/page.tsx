import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import type { MonthData } from "@/lib/schema";
import { DashboardView } from "@/components/dashboard/DashboardView";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/sign-in");

  const activeMonth = currentMonthKey();
  const monthData: MonthData = {
    income: {},
    expenses: [],
  };

  return (
    <div className="relative bg-gray-50 dark:bg-gray-950">
      <div className="absolute right-4 top-4 z-10 sm:right-6 sm:top-6">
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
      </div>
      <DashboardView
        monthData={monthData}
        availableMonths={[activeMonth]}
        activeMonth={activeMonth}
        householdName="Your household"
      />
    </div>
  );
}
