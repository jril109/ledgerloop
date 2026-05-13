import type { ExpenseCategory } from "@/lib/schema";

// Order matches the ExpenseCategory union order in lib/schema.ts. Subtotals and
// the category <select> render in this order.
export const EXPENSE_CATEGORIES: readonly ExpenseCategory[] = [
  "Housing",
  "Food",
  "Transport",
  "Utilities",
  "Health",
  "Entertainment",
  "Personal",
  "Other",
] as const;

const CATEGORY_BADGE_CLASS: Record<ExpenseCategory, string> = {
  Housing:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  Food: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  Transport: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  Utilities:
    "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  Health: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  Entertainment:
    "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/40 dark:text-fuchsia-300",
  Personal:
    "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  Other: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function categoryBadgeClass(category: ExpenseCategory): string {
  return CATEGORY_BADGE_CLASS[category];
}
