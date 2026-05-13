"use client";

interface MonthSelectorProps {
  months: string[];
  active: string;
  onChange: (m: string) => void;
}

const LABEL_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  year: "numeric",
});

function formatMonthLabel(monthKey: string): string {
  const [yearStr, monthStr] = monthKey.split("-");
  const year = Number(yearStr);
  const monthIndex = Number(monthStr) - 1;
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(monthIndex) ||
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    return monthKey;
  }
  return LABEL_FORMATTER.format(new Date(year, monthIndex, 1));
}

export function MonthSelector({ months, active, onChange }: MonthSelectorProps) {
  const sorted = [...months].sort((a, b) => (a < b ? 1 : a > b ? -1 : 0));

  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-gray-700 dark:text-gray-200">Month</span>
      <select
        value={active}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
      >
        {sorted.map((monthKey) => (
          <option key={monthKey} value={monthKey}>
            {formatMonthLabel(monthKey)}
          </option>
        ))}
      </select>
    </label>
  );
}
