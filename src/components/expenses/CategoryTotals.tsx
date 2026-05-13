"use client";

import { useMemo } from "react";
import type { ExpenseCategory, ExpenseEntry } from "@/lib/schema";
import {
  EXPENSE_CATEGORIES,
  categoryBadgeClass,
} from "@/components/expenses/categories";

interface CategoryTotalsProps {
  entries: ExpenseEntry[];
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(amount);
}

function buildSubtotals(
  entries: ExpenseEntry[],
): { category: ExpenseCategory; total: number }[] {
  const totals: Record<ExpenseCategory, number> = {
    Housing: 0,
    Food: 0,
    Transport: 0,
    Utilities: 0,
    Health: 0,
    Entertainment: 0,
    Personal: 0,
    Other: 0,
  };
  for (const entry of entries) {
    totals[entry.category] += entry.amount;
  }
  return EXPENSE_CATEGORIES.filter((c) => totals[c] > 0).map((c) => ({
    category: c,
    total: totals[c],
  }));
}

export function CategoryTotals({ entries }: CategoryTotalsProps) {
  const subtotals = useMemo(() => buildSubtotals(entries), [entries]);
  const monthTotal = useMemo(
    () => entries.reduce((sum, e) => sum + e.amount, 0),
    [entries],
  );

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-sm font-medium text-gray-700 dark:text-gray-200">
        By category
      </h2>
      {subtotals.length === 0 ? (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No expenses yet this month.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {subtotals.map(({ category, total }) => (
            <li
              key={category}
              className="flex items-center justify-between gap-3"
            >
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${categoryBadgeClass(category)}`}
              >
                {category}
              </span>
              <span className="text-sm font-semibold tabular-nums text-gray-900 dark:text-gray-100">
                {formatCurrency(total)}
              </span>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-1 flex items-center justify-between border-t border-gray-200 pt-3 dark:border-gray-800">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          Month total
        </span>
        <span className="text-base font-semibold tabular-nums text-gray-900 dark:text-gray-100">
          {formatCurrency(monthTotal)}
        </span>
      </div>
    </div>
  );
}
