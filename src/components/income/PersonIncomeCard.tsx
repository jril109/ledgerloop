"use client";

import type { IncomeEntry, Person } from "@/lib/schema";
import { formatCurrency } from "@/lib/format";
import { IncomeRow } from "./IncomeRow";
import { AddIncomeRow } from "./AddIncomeRow";

interface PersonIncomeCardProps {
  person: Person;
  entries: IncomeEntry[];
  total: number;
  readOnly?: boolean;
  onAdd: (label: string, amount: number) => void;
  onUpdate: (entry: IncomeEntry) => void;
  onRemove: (entryId: string) => void;
}

export function PersonIncomeCard({
  person,
  entries,
  total,
  readOnly,
  onAdd,
  onUpdate,
  onRemove,
}: PersonIncomeCardProps) {
  return (
    <section
      aria-label={`${person.name} income`}
      className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900"
    >
      <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-2">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100">
            {person.name}
          </h3>
          {person.title && (
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {person.title}
            </p>
          )}
        </div>
        <p className="shrink-0 text-base font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
          {formatCurrency(total)}
        </p>
      </header>

      <div className="pb-1">
        {entries.length === 0 ? (
          <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
            No income yet.
          </p>
        ) : (
          entries.map((entry) => (
            <IncomeRow
              key={entry.id}
              entry={entry}
              readOnly={readOnly}
              onChange={onUpdate}
              onDelete={() => onRemove(entry.id)}
            />
          ))
        )}
        {!readOnly && <AddIncomeRow onAdd={onAdd} />}
      </div>
    </section>
  );
}
