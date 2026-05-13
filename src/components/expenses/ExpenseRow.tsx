"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ExpenseCategory, ExpenseEntry, Person } from "@/lib/schema";
import {
  EXPENSE_CATEGORIES,
  categoryBadgeClass,
} from "@/components/expenses/categories";

interface ExpenseRowProps {
  entry: ExpenseEntry;
  people: Person[];
  onUpdate: (next: ExpenseEntry) => void;
  onRemove: (id: string) => void;
}

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(amount: number): string {
  return CURRENCY_FORMATTER.format(amount);
}

function parseAmount(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  return Math.round(value * 100) / 100;
}

function personLabel(personId: string | null, people: Person[]): string | null {
  if (!personId) return null;
  const match = people.find((p) => p.id === personId);
  return match ? match.name : null;
}

export function ExpenseRow({
  entry,
  people,
  onUpdate,
  onRemove,
}: ExpenseRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(entry.label);
  const [amount, setAmount] = useState(entry.amount.toString());
  const [category, setCategory] = useState<ExpenseCategory>(entry.category);
  const [selectedPerson, setSelectedPerson] = useState<string>(
    entry.personId ?? "",
  );
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const labelInputRef = useRef<HTMLInputElement | null>(null);
  const labelId = useId();
  const amountId = useId();
  const categoryId = useId();
  const personId = useId();

  useEffect(() => {
    if (isEditing) {
      labelInputRef.current?.focus();
    }
  }, [isEditing]);

  function startEditing() {
    setLabel(entry.label);
    setAmount(entry.amount.toString());
    setCategory(entry.category);
    setSelectedPerson(entry.personId ?? "");
    setError(null);
    setIsEditing(true);
  }

  function cancelEditing() {
    setIsEditing(false);
    setError(null);
  }

  function commit() {
    const trimmedLabel = label.trim();
    if (!trimmedLabel) {
      setError("Label is required");
      return;
    }
    const parsedAmount = parseAmount(amount);
    if (parsedAmount === null) {
      setError("Amount must be a non-negative number");
      return;
    }
    setError(null);
    onUpdate({
      ...entry,
      label: trimmedLabel,
      amount: parsedAmount,
      category,
      personId: selectedPerson === "" ? null : selectedPerson,
    });
    setIsEditing(false);
  }

  const personName = personLabel(entry.personId, people);

  if (isEditing) {
    return (
      <li className="rounded-xl border border-emerald-300 bg-white p-3 shadow-sm dark:border-emerald-600 dark:bg-gray-900">
        <div className="flex flex-col gap-2">
          <div className="flex flex-col gap-1">
            <label
              htmlFor={labelId}
              className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              Label
            </label>
            <input
              ref={labelInputRef}
              id={labelId}
              type="text"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor={amountId}
              className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              Amount (USD)
            </label>
            <input
              id={amountId}
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base tabular-nums text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor={categoryId}
              className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              Category
            </label>
            <select
              id={categoryId}
              value={category}
              onChange={(event) =>
                setCategory(event.target.value as ExpenseCategory)
              }
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label
              htmlFor={personId}
              className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400"
            >
              Person (optional)
            </label>
            <select
              id={personId}
              value={selectedPerson}
              onChange={(event) => setSelectedPerson(event.target.value)}
              disabled={people.length === 0}
              className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
            >
              <option value="">— None —</option>
              {people.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {error ? (
            <p
              role="alert"
              className="text-sm text-rose-600 dark:text-rose-400"
            >
              {error}
            </p>
          ) : null}

          <div className="mt-1 flex gap-2">
            <button
              type="button"
              onClick={commit}
              className="min-h-11 flex-1 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
            >
              Save
            </button>
            <button
              type="button"
              onClick={cancelEditing}
              className="min-h-11 flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      </li>
    );
  }

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
            {personName ? (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {personName}
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

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={startEditing}
          aria-label={`Edit ${entry.label}`}
          className="min-h-11 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Edit
        </button>
        {confirmingDelete ? (
          <>
            <button
              type="button"
              onClick={() => {
                onRemove(entry.id);
                setConfirmingDelete(false);
              }}
              aria-label={`Confirm delete ${entry.label}`}
              className="min-h-11 flex-1 rounded-lg bg-rose-500 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-rose-600"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setConfirmingDelete(false)}
              aria-label="Cancel delete"
              className="min-h-11 flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            aria-label={`Delete ${entry.label}`}
            className="min-h-11 flex-1 rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-medium text-rose-600 shadow-sm transition hover:bg-rose-50 dark:border-rose-800 dark:bg-gray-900 dark:text-rose-300 dark:hover:bg-rose-950"
          >
            Delete
          </button>
        )}
      </div>
    </li>
  );
}
