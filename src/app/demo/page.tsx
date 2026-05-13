"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useDataFile } from "@/components/data/DataFileProvider";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { IncomeTracker } from "@/components/income/IncomeTracker";
import type { MonthData } from "@/lib/schema";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function emptyMonth(): MonthData {
  return { income: {}, expenses: [] };
}

export default function DemoDashboardPage() {
  const { data } = useDataFile();
  const activeMonth = currentMonthKey();
  const availableMonths = useMemo(
    () => Object.keys(data.months).sort().reverse(),
    [data.months],
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(activeMonth);
  const monthData = data.months[selectedMonth] ?? emptyMonth();
  const householdName = data.householdName || "Your household";

  return (
    <>
      <DashboardView
        monthData={monthData}
        availableMonths={availableMonths}
        activeMonth={activeMonth}
        householdName={householdName}
        selectedMonth={selectedMonth}
        onSelectedMonthChange={setSelectedMonth}
      />
      <div className="mx-auto w-full max-w-2xl px-4 pb-6 sm:px-6">
        <IncomeTracker monthKey={selectedMonth} />
      </div>
      <nav
        aria-label="Demo sections"
        className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 pb-10 sm:flex-row sm:px-6"
      >
        <Link
          href="/demo/income"
          className="min-h-11 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Income
        </Link>
        <Link
          href="/demo/expenses"
          className="min-h-11 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Expenses
        </Link>
      </nav>
    </>
  );
}
