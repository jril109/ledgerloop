"use client";

import { useState } from "react";
import { SwitchOutModal } from "@/components/demo/SwitchOutModal";

export function DemoBanner() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div
        role="region"
        aria-label="Demo mode notice"
        className="sticky top-0 z-40 w-full border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-amber-900 shadow-sm dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200 sm:px-6"
      >
        <div className="mx-auto flex w-full max-w-3xl flex-row items-center justify-between gap-3">
          <p className="text-xs font-medium leading-snug sm:text-sm">
            Demo mode — your changes are temporary. Sign in to keep them.
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 rounded-lg bg-amber-900 px-3 py-1.5 text-xs font-semibold text-amber-50 shadow-sm transition hover:bg-amber-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-700 dark:bg-amber-200 dark:text-amber-950 dark:hover:bg-amber-100 sm:text-sm"
          >
            Sign in
          </button>
        </div>
      </div>
      <SwitchOutModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
