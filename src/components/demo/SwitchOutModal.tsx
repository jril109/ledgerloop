"use client";

import {
  useCallback,
  useEffect,
  useRef,
} from "react";
import { signIn } from "next-auth/react";
import { useDataFile } from "@/components/data/DataFileProvider";

interface SwitchOutModalProps {
  open: boolean;
  onClose: () => void;
}

const FOCUSABLE =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

export function SwitchOutModal({ open, onClose }: SwitchOutModalProps) {
  const { data } = useDataFile();
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    previousFocusRef.current =
      typeof document !== "undefined"
        ? (document.activeElement as HTMLElement | null)
        : null;

    const onKey = (ev: KeyboardEvent) => {
      if (ev.key === "Escape") {
        ev.preventDefault();
        onClose();
        return;
      }
      if (ev.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (ev.shiftKey && document.activeElement === first) {
          ev.preventDefault();
          last.focus();
        } else if (!ev.shiftKey && document.activeElement === last) {
          ev.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    // Focus the first focusable element when opened
    const focusFirst = () => {
      const focusable =
        dialogRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE);
      focusable?.[0]?.focus();
    };
    focusFirst();

    return () => {
      document.removeEventListener("keydown", onKey);
      previousFocusRef.current?.focus?.();
    };
  }, [open, onClose]);

  const handleDiscard = useCallback(() => {
    void signIn("google", { callbackUrl: "/dashboard" });
  }, []);

  const handleImport = useCallback(() => {
    try {
      sessionStorage.setItem("ll.demo.import", "true");
      sessionStorage.setItem("ll.demo.snapshot", JSON.stringify(data));
    } catch {
      // sessionStorage may be unavailable (private mode); proceed regardless.
    }
    void signIn("google", { callbackUrl: "/dashboard" });
  }, [data]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="presentation"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="switch-out-title"
        aria-describedby="switch-out-description"
        className="w-full max-w-md rounded-t-2xl bg-white p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-xl dark:bg-gray-900 sm:rounded-2xl sm:pb-6"
        onClick={(ev) => ev.stopPropagation()}
      >
        <h2
          id="switch-out-title"
          className="text-lg font-semibold text-gray-900 dark:text-white"
        >
          Sign in to LedgerLoop
        </h2>
        <p
          id="switch-out-description"
          className="mt-2 text-sm text-gray-600 dark:text-gray-300"
        >
          What should we do with your demo data?
        </p>

        <div className="mt-5 flex flex-col gap-3">
          <button
            type="button"
            onClick={handleImport}
            className="min-h-11 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            Try to import after sign-in
          </button>
          <button
            type="button"
            onClick={handleDiscard}
            className="min-h-11 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Discard demo data
          </button>
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-500 transition hover:text-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-400 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
