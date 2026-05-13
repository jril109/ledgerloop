"use client";

import { useState } from "react";
import type { MonthData } from "@/lib/schema";
import { net, percentSpent, totalExpenses, totalIncome } from "@/lib/totals";
import { MonthSelector } from "@/components/dashboard/MonthSelector";
import { ProgressBar } from "@/components/dashboard/ProgressBar";

interface DashboardViewProps {
  monthData: MonthData;
  availableMonths: string[];
  activeMonth: string;
  householdName: string;
  selectedMonth?: string;
  onSelectedMonthChange?: (month: string) => void;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(amount);
}

export function DashboardView({
  monthData,
  availableMonths,
  activeMonth,
  householdName,
  selectedMonth: controlledMonth,
  onSelectedMonthChange,
}: DashboardViewProps) {
  const [internalMonth, setInternalMonth] = useState<string>(activeMonth);
  const selectedMonth = controlledMonth ?? internalMonth;
  const setSelectedMonth = onSelectedMonthChange ?? setInternalMonth;

  const income = totalIncome(monthData);
  const expenses = totalExpenses(monthData);
  const balance = net(monthData);
  const percent = percentSpent(monthData);

  const netClass =
    balance >= 0
      ? "text-emerald-600 dark:text-emerald-400"
      : "text-rose-600 dark:text-rose-400";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Household
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">{householdName}</h1>
        </header>

        <section className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900 sm:p-6">
          <MonthSelector
            months={availableMonths}
            active={selectedMonth}
            onChange={setSelectedMonth}
          />
        </section>

        <section
          aria-label="Monthly totals"
          className="grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Income
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400 sm:text-4xl">
              {formatCurrency(income)}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Expenses
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-gray-900 dark:text-gray-100 sm:text-4xl">
              {formatCurrency(expenses)}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Net
            </p>
            <p
              className={`mt-2 text-3xl font-semibold tabular-nums sm:text-4xl ${netClass}`}
            >
              {formatCurrency(balance)}
            </p>
          </div>
        </section>

        <section className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900 sm:p-6">
          <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            Spending vs. income
          </h2>
          <ProgressBar percent={percent} />
        </section>
      </div>
    </main>
  );
}
