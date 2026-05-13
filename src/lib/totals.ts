import type { MonthData } from "@/lib/schema";

export function totalIncome(month: MonthData): number {
  let sum = 0;
  for (const entries of Object.values(month.income)) {
    for (const entry of entries) {
      sum += entry.amount;
    }
  }
  return sum;
}

export function personIncomeTotal(
  month: MonthData,
  personId: string,
): number {
  const entries = month.income[personId];
  if (!entries) return 0;
  let sum = 0;
  for (const entry of entries) {
    sum += entry.amount;
  }
  return sum;
}

export function householdIncomeTotal(month: MonthData): number {
  return totalIncome(month);
}

export function totalExpenses(month: MonthData): number {
  let sum = 0;
  for (const entry of month.expenses) {
    sum += entry.amount;
  }
  return sum;
}

export function net(month: MonthData): number {
  return totalIncome(month) - totalExpenses(month);
}

export function percentSpent(month: MonthData): number {
  const income = totalIncome(month);
  if (income === 0) return 0;
  return (totalExpenses(month) / income) * 100;
}
