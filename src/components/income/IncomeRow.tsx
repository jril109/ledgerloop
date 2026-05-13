"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";
import type { IncomeEntry } from "@/lib/schema";
import { formatCurrency } from "@/lib/format";

interface IncomeRowProps {
  entry: IncomeEntry;
  readOnly?: boolean;
  onChange: (entry: IncomeEntry) => void;
  onDelete: () => void;
}

type EditField = "label" | "amount" | null;

const AMOUNT_RE = /^\d*\.?\d{0,2}$/;

export function IncomeRow({
  entry,
  readOnly,
  onChange,
  onDelete,
}: IncomeRowProps) {
  const [editing, setEditing] = useState<EditField>(null);
  const [labelDraft, setLabelDraft] = useState<string>(entry.label);
  const [amountDraft, setAmountDraft] = useState<string>(
    entry.amount.toString(),
  );
  const [confirmingDelete, setConfirmingDelete] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const confirmTimer = useRef<number | null>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    return () => {
      if (confirmTimer.current !== null) {
        window.clearTimeout(confirmTimer.current);
      }
    };
  }, []);

  const cancelEdit = useCallback(() => setEditing(null), []);

  const commitLabel = useCallback(() => {
    const next = labelDraft.trim();
    if (next.length > 0 && next !== entry.label) {
      onChange({ ...entry, label: next });
    }
    setEditing(null);
  }, [labelDraft, entry, onChange]);

  const commitAmount = useCallback(() => {
    const parsed = Number.parseFloat(amountDraft);
    if (Number.isFinite(parsed) && parsed >= 0 && parsed !== entry.amount) {
      onChange({ ...entry, amount: Math.round(parsed * 100) / 100 });
    }
    setEditing(null);
  }, [amountDraft, entry, onChange]);

  const onAmountInput = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    const v = ev.target.value;
    if (v === "" || AMOUNT_RE.test(v)) {
      setAmountDraft(v);
    }
  }, []);

  const onLabelKey = useCallback(
    (ev: KeyboardEvent<HTMLInputElement>) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        commitLabel();
      } else if (ev.key === "Escape") {
        ev.preventDefault();
        cancelEdit();
      }
    },
    [commitLabel, cancelEdit],
  );

  const onAmountKey = useCallback(
    (ev: KeyboardEvent<HTMLInputElement>) => {
      if (ev.key === "Enter") {
        ev.preventDefault();
        commitAmount();
      } else if (ev.key === "Escape") {
        ev.preventDefault();
        cancelEdit();
      }
    },
    [commitAmount, cancelEdit],
  );

  const handleDeleteTap = useCallback(() => {
    if (confirmingDelete) {
      if (confirmTimer.current !== null) {
        window.clearTimeout(confirmTimer.current);
        confirmTimer.current = null;
      }
      setConfirmingDelete(false);
      onDelete();
      return;
    }
    setConfirmingDelete(true);
    confirmTimer.current = window.setTimeout(() => {
      setConfirmingDelete(false);
      confirmTimer.current = null;
    }, 3000);
  }, [confirmingDelete, onDelete]);

  return (
    <div className="flex min-h-11 items-center gap-2 border-t border-gray-100 px-3 py-2 first:border-t-0 dark:border-gray-800">
      <div className="flex-1 min-w-0">
        {editing === "label" ? (
          <input
            ref={inputRef}
            type="text"
            value={labelDraft}
            onChange={(ev) => setLabelDraft(ev.target.value)}
            onBlur={commitLabel}
            onKeyDown={onLabelKey}
            className="w-full rounded-md bg-gray-50 px-2 py-1 text-sm text-gray-900 outline-none ring-2 ring-emerald-500 dark:bg-gray-800 dark:text-gray-100"
            aria-label="Edit income label"
          />
        ) : (
          <button
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (readOnly) return;
              setLabelDraft(entry.label);
              setEditing("label");
            }}
            className="w-full truncate text-left text-sm text-gray-900 disabled:cursor-default dark:text-gray-100"
          >
            {entry.label}
          </button>
        )}
      </div>

      <div className="w-28 shrink-0 text-right">
        {editing === "amount" ? (
          <input
            ref={inputRef}
            type="text"
            inputMode="decimal"
            value={amountDraft}
            onChange={onAmountInput}
            onBlur={commitAmount}
            onKeyDown={onAmountKey}
            className="w-full rounded-md bg-gray-50 px-2 py-1 text-right text-sm tabular-nums text-gray-900 outline-none ring-2 ring-emerald-500 dark:bg-gray-800 dark:text-gray-100"
            aria-label="Edit income amount"
          />
        ) : (
          <button
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (readOnly) return;
              setAmountDraft(entry.amount.toString());
              setEditing("amount");
            }}
            className="w-full text-right text-sm font-medium tabular-nums text-gray-900 disabled:cursor-default dark:text-gray-100"
          >
            {formatCurrency(entry.amount)}
          </button>
        )}
      </div>

      {!readOnly && (
        <button
          type="button"
          onClick={handleDeleteTap}
          aria-label={confirmingDelete ? "Confirm delete" : "Delete"}
          className={
            confirmingDelete
              ? "min-h-11 shrink-0 rounded-md bg-rose-600 px-3 py-1 text-xs font-semibold text-white shadow-sm"
              : "flex h-11 w-11 shrink-0 items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-rose-600 dark:hover:bg-gray-800"
          }
        >
          {confirmingDelete ? "Confirm" : (
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="h-5 w-5"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 2a1 1 0 0 0-1 1v1H4a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2h-3V3a1 1 0 0 0-1-1H8Zm-3 6a1 1 0 0 1 1 1v7a1 1 0 1 0 2 0V9a1 1 0 1 1 2 0v7a1 1 0 1 0 2 0V9a1 1 0 1 1 2 0v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3V9a1 1 0 0 1 0-1Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
      )}
    </div>
  );
}
