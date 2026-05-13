"use client";

import { useCallback } from "react";
import { useDataFile } from "@/components/data/DataFileProvider";
import type { IncomeEntry } from "@/lib/schema";
import { formatCurrency } from "@/lib/format";
import {
  householdIncomeTotal,
  personIncomeTotal,
} from "@/lib/totals";
import { PersonIncomeCard } from "./PersonIncomeCard";

interface IncomeTrackerProps {
  monthKey: string;
  readOnly?: boolean;
}

function makeId(): string {
  return crypto.randomUUID();
}

function statusLabel(
  status: ReturnType<typeof useDataFile>["saveStatus"],
): string | null {
  switch (status) {
    case "saving":
      return "Saving…";
    case "error-retrying":
      return "Retrying save…";
    case "error-persistent":
      return "Couldn’t save to Drive";
    case "idle":
    default:
      return null;
  }
}

export function IncomeTracker({ monthKey, readOnly }: IncomeTrackerProps) {
  const {
    data,
    isDemo,
    addIncome,
    updateIncome,
    removeIncome,
    saveStatus,
  } = useDataFile();

  const month = data.months[monthKey] ?? { income: {}, expenses: [] };

  const handleAdd = useCallback(
    (personId: string) => (label: string, amount: number) => {
      const entry: IncomeEntry = { id: makeId(), label, amount };
      addIncome(monthKey, personId, entry);
    },
    [addIncome, monthKey],
  );

  const handleUpdate = useCallback(
    (personId: string) => (entry: IncomeEntry) => {
      updateIncome(monthKey, personId, entry);
    },
    [updateIncome, monthKey],
  );

  const handleRemove = useCallback(
    (personId: string) => (entryId: string) => {
      removeIncome(monthKey, personId, entryId);
    },
    [removeIncome, monthKey],
  );

  const householdTotal = householdIncomeTotal(month);
  const status = isDemo ? null : statusLabel(saveStatus);
  const persistentError = !isDemo && saveStatus === "error-persistent";

  if (data.people.length === 0) {
    return (
      <section
        aria-label="Income"
        className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
      >
        Add a household member to start tracking income.
      </section>
    );
  }

  return (
    <section aria-label="Income tracker" className="flex flex-col gap-4">
      <header className="flex items-center justify-between">
        <h2 className="text-sm font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          Income
        </h2>
        {status && (
          <span
            aria-live="polite"
            className={
              persistentError
                ? "text-xs font-medium text-rose-600 dark:text-rose-400"
                : "text-xs text-gray-400 dark:text-gray-500"
            }
          >
            {status}
          </span>
        )}
      </header>

      {persistentError && (
        <div
          role="alert"
          className="rounded-md border border-rose-300 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300"
        >
          Your changes are saved on this device, but we couldn’t reach Google
          Drive. Check your connection — they’ll save on your next edit.
        </div>
      )}

      {data.people.map((person) => {
        const entries = month.income[person.id] ?? [];
        return (
          <PersonIncomeCard
            key={person.id}
            person={person}
            entries={entries}
            total={personIncomeTotal(month, person.id)}
            readOnly={readOnly}
            onAdd={handleAdd(person.id)}
            onUpdate={handleUpdate(person.id)}
            onRemove={handleRemove(person.id)}
          />
        );
      })}

      <footer className="sticky bottom-0 z-10 -mx-1 flex items-center justify-between rounded-2xl bg-gray-900 px-4 py-3 text-white shadow-lg dark:bg-gray-800">
        <span className="text-sm font-medium">Household total</span>
        <span className="text-lg font-semibold tabular-nums">
          {formatCurrency(householdTotal)}
        </span>
      </footer>
    </section>
  );
}
