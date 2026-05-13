"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

interface AddIncomeRowProps {
  onAdd: (label: string, amount: number) => void;
  disabled?: boolean;
}

const AMOUNT_RE = /^\d*\.?\d{0,2}$/;

export function AddIncomeRow({ onAdd, disabled }: AddIncomeRowProps) {
  const [expanded, setExpanded] = useState(false);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const labelRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (expanded) labelRef.current?.focus();
  }, [expanded]);

  const reset = useCallback(() => {
    setLabel("");
    setAmount("");
    setExpanded(false);
  }, []);

  const canSave =
    label.trim().length > 0 &&
    amount.length > 0 &&
    Number.isFinite(Number.parseFloat(amount)) &&
    Number.parseFloat(amount) > 0;

  const onSave = useCallback(() => {
    if (!canSave) return;
    const parsed = Number.parseFloat(amount);
    onAdd(label.trim(), Math.round(parsed * 100) / 100);
    reset();
  }, [canSave, amount, label, onAdd, reset]);

  const onAmountInput = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    const v = ev.target.value;
    if (v === "" || AMOUNT_RE.test(v)) setAmount(v);
  }, []);

  const onKey = useCallback(
    (ev: KeyboardEvent<HTMLInputElement>) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        onSave();
      } else if (ev.key === "Escape") {
        ev.preventDefault();
        reset();
      }
    },
    [onSave, reset],
  );

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        disabled={disabled}
        className="flex min-h-11 w-full items-center gap-2 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:text-gray-400 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
      >
        <span
          aria-hidden="true"
          className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
        >
          +
        </span>
        Add income
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 border-t border-gray-100 px-3 py-2 dark:border-gray-800">
      <input
        ref={labelRef}
        type="text"
        value={label}
        onChange={(ev) => setLabel(ev.target.value)}
        onKeyDown={onKey}
        placeholder="Paycheck"
        aria-label="Income label"
        className="min-h-11 flex-1 rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-900 outline-none ring-2 ring-emerald-500 dark:bg-gray-800 dark:text-gray-100"
      />
      <input
        type="text"
        inputMode="decimal"
        value={amount}
        onChange={onAmountInput}
        onKeyDown={onKey}
        placeholder="0.00"
        aria-label="Income amount"
        className="min-h-11 w-24 rounded-md bg-gray-50 px-2 py-1 text-right text-sm tabular-nums text-gray-900 outline-none ring-2 ring-emerald-500 dark:bg-gray-800 dark:text-gray-100"
      />
      <button
        type="button"
        onClick={onSave}
        disabled={!canSave}
        aria-label="Save income"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-gray-300 dark:disabled:bg-gray-700"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M16.704 5.296a1 1 0 0 1 0 1.408l-7.5 7.5a1 1 0 0 1-1.408 0l-3.5-3.5a1 1 0 1 1 1.408-1.408L8.5 12.092l6.796-6.796a1 1 0 0 1 1.408 0Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <button
        type="button"
        onClick={reset}
        aria-label="Cancel"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-5 w-5"
        >
          <path
            fillRule="evenodd"
            d="M4.293 4.293a1 1 0 0 1 1.414 0L10 8.586l4.293-4.293a1 1 0 1 1 1.414 1.414L11.414 10l4.293 4.293a1 1 0 0 1-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 0 1-1.414-1.414L8.586 10 4.293 5.707a1 1 0 0 1 0-1.414Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
