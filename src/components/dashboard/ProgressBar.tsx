"use client";

interface ProgressBarProps {
  percent: number;
}

function fillColorClass(percent: number): string {
  if (percent > 100) return "bg-rose-500 dark:bg-rose-400";
  if (percent >= 80) return "bg-amber-500 dark:bg-amber-400";
  return "bg-emerald-500 dark:bg-emerald-400";
}

export function ProgressBar({ percent }: ProgressBarProps) {
  const safePercent = Number.isFinite(percent) ? percent : 0;
  const visualWidth = Math.max(0, Math.min(100, safePercent));
  const rounded = Math.round(safePercent);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.min(100, Math.max(0, rounded))}
      >
        <div
          className={`h-full rounded-full transition-[width] duration-300 ${fillColorClass(safePercent)}`}
          style={{ width: `${visualWidth}%` }}
        />
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300">
        {rounded}% of income spent
      </p>
    </div>
  );
}
