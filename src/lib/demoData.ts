import type {
  DataFile,
  ExpenseEntry,
  IncomeEntry,
  MonthData,
  Person,
} from "@/lib/schema";

const PERSON_ALEX: Person = {
  id: "p_alex",
  name: "Alex Rivera",
  title: "Partner",
};

const PERSON_JAMIE: Person = {
  id: "p_jamie",
  name: "Jamie Rivera",
  title: "Partner",
};

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function offsetMonth(base: Date, monthsBack: number): Date {
  return new Date(base.getFullYear(), base.getMonth() - monthsBack, 1);
}

function income(
  id: string,
  label: string,
  amount: number,
): IncomeEntry {
  return { id, label, amount };
}

function expense(
  id: string,
  label: string,
  amount: number,
  category: ExpenseEntry["category"],
  personId: string | null,
): ExpenseEntry {
  return { id, label, amount, category, personId };
}

function buildMonth(suffix: string, scale: number): MonthData {
  return {
    income: {
      [PERSON_ALEX.id]: [
        income(`inc_${suffix}_a1`, "Salary - Acme Co.", 4200 * scale),
        income(`inc_${suffix}_a2`, "Freelance writing", 350 * scale),
      ],
      [PERSON_JAMIE.id]: [
        income(`inc_${suffix}_j1`, "Salary - Lighthouse Labs", 3800 * scale),
      ],
    },
    expenses: [
      expense(`exp_${suffix}_1`, "Rent", 2150, "Housing", null),
      expense(`exp_${suffix}_2`, "Electric + gas", 142, "Utilities", null),
      expense(`exp_${suffix}_3`, "Internet", 75, "Utilities", null),
      expense(`exp_${suffix}_4`, "Groceries", 612, "Food", PERSON_ALEX.id),
      expense(`exp_${suffix}_5`, "Dining out", 184, "Food", PERSON_JAMIE.id),
      expense(`exp_${suffix}_6`, "Gasoline", 96, "Transport", PERSON_ALEX.id),
      expense(`exp_${suffix}_7`, "Transit pass", 88, "Transport", PERSON_JAMIE.id),
      expense(`exp_${suffix}_8`, "Streaming subs", 42, "Entertainment", null),
    ],
  };
}

export function getDemoDataFile(): DataFile {
  const now = new Date();
  const current = offsetMonth(now, 0);
  const prior = offsetMonth(now, 1);
  const twoPrior = offsetMonth(now, 2);

  return {
    version: 1,
    householdName: "The Rivera Household",
    people: [PERSON_ALEX, PERSON_JAMIE],
    months: {
      [monthKey(current)]: buildMonth("m0", 1),
      [monthKey(prior)]: buildMonth("m1", 1),
      [monthKey(twoPrior)]: buildMonth("m2", 0.95),
    },
    preferences: {},
    tier: "free",
  };
}
