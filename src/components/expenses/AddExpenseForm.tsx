"use client";

import { useId, useState, type FormEvent } from "react";
import type { ExpenseCategory, ExpenseEntry, Person } from "@/lib/schema";
import { EXPENSE_CATEGORIES } from "@/components/expenses/categories";

interface AddExpenseFormProps {
  people: Person[];
  onAdd: (entry: ExpenseEntry) => void;
}

const PERSON_NONE = "";
const DEFAULT_CATEGORY: ExpenseCategory = "Other";

function parseAmount(raw: string): number | null {
  if (raw.trim() === "") return null;
  const value = Number(raw);
  if (!Number.isFinite(value) || value < 0) return null;
  // Two-decimal rounding so cents from input are preserved precisely.
  return Math.round(value * 100) / 100;
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `exp_${crypto.randomUUID()}`;
  }
  return `exp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function AddExpenseForm({ people, onAdd }: AddExpenseFormProps) {
  const labelId = useId();
  const amountId = useId();
  const categoryId = useId();
  const personId = useId();

  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<ExpenseCategory>(DEFAULT_CATEGORY);
  const [selectedPerson, setSelectedPerson] = useState<string>(PERSON_NONE);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
    onAdd({
      id: generateId(),
      label: trimmedLabel,
      amount: parsedAmount,
      category,
      personId: selectedPerson === PERSON_NONE ? null : selectedPerson,
    });
    setLabel("");
    setAmount("");
    setCategory(DEFAULT_CATEGORY);
    setSelectedPerson(PERSON_NONE);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3"
      aria-label="Add expense"
    >
      <div className="flex flex-col gap-1">
        <label
          htmlFor={labelId}
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          Label
        </label>
        <input
          id={labelId}
          type="text"
          value={label}
          onChange={(event) => setLabel(event.target.value)}
          placeholder="Groceries"
          required
          className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor={amountId}
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
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
          placeholder="0.00"
          required
          className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base tabular-nums text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label
          htmlFor={categoryId}
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
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
          className="text-sm font-medium text-gray-700 dark:text-gray-200"
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
          <option value={PERSON_NONE}>— None —</option>
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

      <button
        type="submit"
        className="min-h-11 rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
      >
        Add expense
      </button>
    </form>
  );
}
