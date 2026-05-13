"use client";

import { useMemo, useState } from "react";
import { useDataFile } from "@/components/data/DataFileProvider";
import { MonthSelector } from "@/components/dashboard/MonthSelector";
import { CategoryTotals } from "@/components/expenses/CategoryTotals";
import { categoryBadgeClass } from "@/components/expenses/categories";
import { formatCurrency } from "@/lib/format";
import type { ExpenseEntry, Person } from "@/lib/schema";

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function personLabel(personId: string | null, people: Person[]): string | null {
  if (!personId) return null;
  const match = people.find((p) => p.id === personId);
  return match ? match.name : null;
}

function ReadOnlyExpenseRow({
  entry,
  people,
}: {
  entry: ExpenseEntry;
  people: Person[];
}) {
  const name = personLabel(entry.personId, people);
  return (
    <li className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(entry.category)}`}
            >
              {entry.category}
            </span>
            {name ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {name}
              </span>
            ) : null}
          </div>
          <p className="mt-1 truncate text-base font-medium text-gray-900 dark:text-gray-100">
            {entry.label}
          </p>
        </div>
        <p className="shrink-0 text-base font-semibold tabular-nums text-gray-900 dark:text-gray-100">
          {formatCurrency(entry.amount)}
        </p>
      </div>
    </li>
  );
}

export default function DemoExpensesPage() {
  const { data } = useDataFile();
  const activeMonth = currentMonthKey();
  const availableMonths = useMemo(
    () => Object.keys(data.months).sort().reverse(),
    [data.months],
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(activeMonth);
  const expenses = data.months[selectedMonth]?.expenses ?? [];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
        <header className="flex flex-col gap-1">
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Expenses
          </p>
          <h1 className="text-2xl font-semibold sm:text-3xl">Expense tracker</h1>
        </header>

        <section className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900 sm:p-6">
          <MonthSelector
            months={availableMonths}
            active={selectedMonth}
            onChange={setSelectedMonth}
          />
        </section>

        <section
          aria-label="Expense entries"
          className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900 sm:p-6"
        >
          <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            Entries
          </h2>
          {expenses.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No expenses this month.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {expenses.map((entry) => (
                <ReadOnlyExpenseRow
                  key={entry.id}
                  entry={entry}
                  people={data.people}
                />
              ))}
            </ul>
          )}
        </section>

        <section
          aria-label="Category subtotals"
          className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900 sm:p-6"
        >
          <CategoryTotals entries={expenses} />
        </section>
      </div>
    </main>
  );
}
