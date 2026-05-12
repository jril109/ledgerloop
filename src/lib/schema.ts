// V1 data model — all user financial data lives in a single encrypted JSON file
// stored in the user's Google Drive. Nothing here touches our database.

export type ExpenseCategory =
  | "Housing"
  | "Food"
  | "Transport"
  | "Utilities"
  | "Health"
  | "Entertainment"
  | "Personal"
  | "Other";

export interface Person {
  id: string;
  name: string;
  title: string;
}

export interface IncomeEntry {
  id: string;
  label: string;
  amount: number;
}

export interface ExpenseEntry {
  id: string;
  label: string;
  amount: number;
  category: ExpenseCategory;
  personId: string | null;
}

export interface MonthData {
  income: Record<string, IncomeEntry[]>; // key: personId
  expenses: ExpenseEntry[];
}

export interface UserPreferences {
  darkMode: boolean;
}

export interface DataFile {
  version: 1;
  householdName: string;
  people: Person[];
  months: Record<string, MonthData>; // key: "YYYY-MM"
  preferences: Record<string, UserPreferences>; // key: google sub claim
  tier: "free" | "byo" | "managed";
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ParseError {
  field: string;
  message: string;
}

export class DataFileParseError extends Error {
  constructor(public readonly errors: ParseError[]) {
    super(`DataFile validation failed: ${errors.map((e) => `${e.field}: ${e.message}`).join("; ")}`);
    this.name = "DataFileParseError";
  }
}

const MONTH_KEY_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const EXPENSE_CATEGORIES = new Set<string>([
  "Housing", "Food", "Transport", "Utilities",
  "Health", "Entertainment", "Personal", "Other",
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validatePerson(value: unknown, path: string, errors: ParseError[]): void {
  if (!isRecord(value)) { errors.push({ field: path, message: "must be an object" }); return; }
  if (typeof value.id !== "string") errors.push({ field: `${path}.id`, message: "must be a string" });
  if (typeof value.name !== "string") errors.push({ field: `${path}.name`, message: "must be a string" });
  if (typeof value.title !== "string") errors.push({ field: `${path}.title`, message: "must be a string" });
}

function validateIncomeEntry(value: unknown, path: string, errors: ParseError[]): void {
  if (!isRecord(value)) { errors.push({ field: path, message: "must be an object" }); return; }
  if (typeof value.id !== "string") errors.push({ field: `${path}.id`, message: "must be a string" });
  if (typeof value.label !== "string") errors.push({ field: `${path}.label`, message: "must be a string" });
  if (typeof value.amount !== "number") errors.push({ field: `${path}.amount`, message: "must be a number" });
}

function validateExpenseEntry(value: unknown, path: string, errors: ParseError[]): void {
  if (!isRecord(value)) { errors.push({ field: path, message: "must be an object" }); return; }
  if (typeof value.id !== "string") errors.push({ field: `${path}.id`, message: "must be a string" });
  if (typeof value.label !== "string") errors.push({ field: `${path}.label`, message: "must be a string" });
  if (typeof value.amount !== "number") errors.push({ field: `${path}.amount`, message: "must be a number" });
  if (typeof value.category !== "string" || !EXPENSE_CATEGORIES.has(value.category)) {
    errors.push({ field: `${path}.category`, message: `must be one of: ${[...EXPENSE_CATEGORIES].join(", ")}` });
  }
  if (value.personId !== null && typeof value.personId !== "string") {
    errors.push({ field: `${path}.personId`, message: "must be a string or null" });
  }
}

function validateMonthData(value: unknown, path: string, errors: ParseError[]): void {
  if (!isRecord(value)) { errors.push({ field: path, message: "must be an object" }); return; }

  if (!isRecord(value.income)) {
    errors.push({ field: `${path}.income`, message: "must be an object" });
  } else {
    for (const [personId, entries] of Object.entries(value.income)) {
      if (!Array.isArray(entries)) {
        errors.push({ field: `${path}.income.${personId}`, message: "must be an array" });
      } else {
        entries.forEach((entry, i) => validateIncomeEntry(entry, `${path}.income.${personId}[${i}]`, errors));
      }
    }
  }

  if (!Array.isArray(value.expenses)) {
    errors.push({ field: `${path}.expenses`, message: "must be an array" });
  } else {
    value.expenses.forEach((entry, i) => validateExpenseEntry(entry, `${path}.expenses[${i}]`, errors));
  }
}

function validateUserPreferences(value: unknown, path: string, errors: ParseError[]): void {
  if (!isRecord(value)) { errors.push({ field: path, message: "must be an object" }); return; }
  if (typeof value.darkMode !== "boolean") {
    errors.push({ field: `${path}.darkMode`, message: "must be a boolean" });
  }
}

/**
 * Parse and validate a raw JSON string into a DataFile.
 * Throws DataFileParseError with structured field errors on failure.
 */
export function parseDataFile(raw: string): DataFile {
  const errors: ParseError[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new DataFileParseError([{ field: "root", message: "invalid JSON" }]);
  }

  if (!isRecord(parsed)) {
    throw new DataFileParseError([{ field: "root", message: "must be an object" }]);
  }

  if (parsed.version !== 1) {
    errors.push({ field: "version", message: "must be 1" });
  }

  if (typeof parsed.householdName !== "string") {
    errors.push({ field: "householdName", message: "must be a string" });
  }

  if (!Array.isArray(parsed.people)) {
    errors.push({ field: "people", message: "must be an array" });
  } else {
    parsed.people.forEach((p, i) => validatePerson(p, `people[${i}]`, errors));
  }

  if (!isRecord(parsed.months)) {
    errors.push({ field: "months", message: "must be an object" });
  } else {
    for (const [key, monthData] of Object.entries(parsed.months)) {
      if (!MONTH_KEY_RE.test(key)) {
        errors.push({ field: `months.${key}`, message: "key must be in YYYY-MM format" });
      }
      validateMonthData(monthData, `months.${key}`, errors);
    }
  }

  if (!isRecord(parsed.preferences)) {
    errors.push({ field: "preferences", message: "must be an object" });
  } else {
    for (const [sub, prefs] of Object.entries(parsed.preferences)) {
      validateUserPreferences(prefs, `preferences.${sub}`, errors);
    }
  }

  if (parsed.tier !== "free" && parsed.tier !== "byo" && parsed.tier !== "managed") {
    errors.push({ field: "tier", message: 'must be "free", "byo", or "managed"' });
  }

  if (errors.length > 0) {
    throw new DataFileParseError(errors);
  }

  return parsed as unknown as DataFile;
}

/**
 * Migrate a DataFile to the latest version.
 * Version 1 is the current latest — this is a no-op.
 * Future versions add migration steps here before the return.
 */
export function migrateDataFile(file: DataFile): DataFile {
  if (file.version === 1) {
    return file;
  }
  // Exhaustiveness check — TypeScript will error here if a new version
  // is added to the union without a migration branch.
  const _exhaustive: never = file.version;
  return _exhaustive;
}
