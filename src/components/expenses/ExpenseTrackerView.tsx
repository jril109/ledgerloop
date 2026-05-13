"use client";

import { useCallback, useMemo, useState } from "react";
import type { ExpenseEntry, Person } from "@/lib/schema";
import { MonthSelector } from "@/components/dashboard/MonthSelector";
import { AddExpenseForm } from "@/components/expenses/AddExpenseForm";
import { ExpenseRow } from "@/components/expenses/ExpenseRow";
import { CategoryTotals } from "@/components/expenses/CategoryTotals";

interface ExpenseTrackerViewProps {
  activeMonth: string;
  availableMonths: string[];
  initialExpenses: ExpenseEntry[];
  people: Person[];
}

// TODO(LED-7/LED-8): once the shared month-selector hook lands, replace this
// local map + the MonthSelector wiring with the consolidated state.
// TODO(LED-8/LED-114): once the authenticated DataFileProvider + encrypt→Drive
// save flow lands, route mutations through useDataFile() instead of holding
// local state, and implement real optimistic-rollback on save failure.

export function ExpenseTrackerView({
  activeMonth,
  availableMonths,
  initialExpenses,
  people,
}: ExpenseTrackerViewProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>(activeMonth);
  const [expensesByMonth, setExpensesByMonth] = useState<
    Record<string, ExpenseEntry[]>
  >(() => ({ [activeMonth]: initialExpenses }));
  const [saveError, setSaveError] = useState<string | null>(null);

  const expenses = useMemo<ExpenseEntry[]>(
    () => expensesByMonth[selectedMonth] ?? [],
    [expensesByMonth, selectedMonth],
  );

  // Mutations are wrapped in a persist() wrapper so the optimistic-update /
  // rollback shape is in place. Today the persist step is a no-op; LED-8 /
  // LED-114 will replace it with the real encrypt → Drive save call.
  const persist = useCallback(
    async (
      apply: (prev: Record<string, ExpenseEntry[]>) => Record<string, ExpenseEntry[]>,
    ) => {
      let snapshot: Record<string, ExpenseEntry[]> | null = null;
      setExpensesByMonth((prev) => {
        snapshot = prev;
        return apply(prev);
      });
      try {
        // TODO(LED-8/LED-114): await encrypt → Drive save here. On rejection
        // rethrow so the rollback below restores the previous state.
        await Promise.resolve();
        setSaveError(null);
      } catch (err) {
        if (snapshot) setExpensesByMonth(snapshot);
        setSaveError(
          err instanceof Error ? err.message : "Failed to save changes",
        );
      }
    },
    [],
  );

  const handleAdd = useCallback(
    (entry: ExpenseEntry) => {
      void persist((prev) => {
        const existing = prev[selectedMonth] ?? [];
        return { ...prev, [selectedMonth]: [...existing, entry] };
      });
    },
    [persist, selectedMonth],
  );

  const handleUpdate = useCallback(
    (next: ExpenseEntry) => {
      void persist((prev) => {
        const existing = prev[selectedMonth] ?? [];
        return {
          ...prev,
          [selectedMonth]: existing.map((e) => (e.id === next.id ? next : e)),
        };
      });
    },
    [persist, selectedMonth],
  );

  const handleRemove = useCallback(
    (id: string) => {
      void persist((prev) => {
        const existing = prev[selectedMonth] ?? [];
        return {
          ...prev,
          [selectedMonth]: existing.filter((e) => e.id !== id),
        };
      });
    },
    [persist, selectedMonth],
  );

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

        {saveError ? (
          <section
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-800 dark:bg-rose-950/40 dark:text-rose-300"
          >
            {saveError}
          </section>
        ) : null}

        <section
          aria-label="Expense entries"
          className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900 sm:p-6"
        >
          <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            Entries
          </h2>
          {expenses.length === 0 ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No expenses yet. Add one below.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {expenses.map((entry) => (
                <ExpenseRow
                  key={entry.id}
                  entry={entry}
                  people={people}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
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

        <section
          aria-label="Add expense"
          className="rounded-2xl bg-white p-5 shadow-sm dark:bg-gray-900 sm:p-6"
        >
          <h2 className="mb-3 text-sm font-medium text-gray-700 dark:text-gray-200">
            Add expense
          </h2>
          <AddExpenseForm people={people} onAdd={handleAdd} />
        </section>
      </div>
    </main>
  );
}
