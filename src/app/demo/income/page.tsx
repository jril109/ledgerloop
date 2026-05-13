"use client";

import { useMemo, useState } from "react";
import { useDataFile } from "@/components/data/DataFileProvider";
import { MonthSelector } from "@/components/dashboard/MonthSelector";
import { IncomeTracker } from "@/components/income/IncomeTracker";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export default function DemoIncomePage() {
  const { data } = useDataFile();
  const activeMonth = currentMonthKey();
  const availableMonths = useMemo(
    () => Object.keys(data.months).sort().reverse(),
    [data.months],
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(activeMonth);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Income
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Income tracker</h1>
        </header>

        <section className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900 sm:p-6">
          <MonthSelector
            months={availableMonths}
            active={selectedMonth}
            onChange={setSelectedMonth}
          />
        </section>

        <IncomeTracker monthKey={selectedMonth} readOnly />
      </div>
    </main>
  );
}
