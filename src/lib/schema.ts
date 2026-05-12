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

// ─── Structured errors ────────────────────────────────────────────────────────

export type SchemaErrorCode =
  | "INVALID_JSON"
  | "INVALID_SCHEMA"
  | "INVALID_MONTH_KEY"
  | "UNKNOWN_VERSION";

export class SchemaError extends Error {
  constructor(
    public readonly code: SchemaErrorCode,
    message: string,
    public readonly path?: string,
  ) {
    super(message);
    this.name = "SchemaError";
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const MONTH_KEY_RE = /^\d{4}-(0[1-9]|1[0-2])$/;
const VALID_TIERS = new Set<string>(["free", "byo", "managed"]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// ─── parseDataFile ────────────────────────────────────────────────────────────

export function parseDataFile(raw: string): DataFile {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new SchemaError("INVALID_JSON", "Failed to parse JSON");
  }

  if (!isRecord(parsed)) {
    throw new SchemaError("INVALID_SCHEMA", "Root value must be a plain object");
  }

  // Version must be checked before other fields so the caller gets UNKNOWN_VERSION
  // rather than INVALID_SCHEMA when the payload is otherwise well-formed.
  if (!("version" in parsed)) {
    throw new SchemaError("INVALID_SCHEMA", "Missing required field: version");
  }
  if (parsed.version !== 1) {
    throw new SchemaError(
      "UNKNOWN_VERSION",
      `Unsupported schema version: ${String(parsed.version)}`,
    );
  }

  for (const field of [
    "householdName",
    "people",
    "months",
    "preferences",
    "tier",
  ] as const) {
    if (!(field in parsed)) {
      throw new SchemaError(
        "INVALID_SCHEMA",
        `Missing required field: ${field}`,
      );
    }
  }

  if (typeof parsed.householdName !== "string") {
    throw new SchemaError("INVALID_SCHEMA", "householdName must be a string");
  }

  if (!Array.isArray(parsed.people)) {
    throw new SchemaError("INVALID_SCHEMA", "people must be an array");
  }

  if (!isRecord(parsed.months)) {
    throw new SchemaError("INVALID_SCHEMA", "months must be a plain object");
  }

  for (const key of Object.keys(parsed.months)) {
    if (!MONTH_KEY_RE.test(key)) {
      throw new SchemaError(
        "INVALID_MONTH_KEY",
        `Invalid month key "${key}": expected YYYY-MM format`,
        `months.${key}`,
      );
    }
  }

  if (!isRecord(parsed.preferences)) {
    throw new SchemaError(
      "INVALID_SCHEMA",
      "preferences must be a plain object",
    );
  }

  if (
    typeof parsed.tier !== "string" ||
    !VALID_TIERS.has(parsed.tier)
  ) {
    throw new SchemaError(
      "INVALID_SCHEMA",
      'tier must be one of: "free", "byo", "managed"',
    );
  }

  return parsed as unknown as DataFile;
}

// ─── migrateDataFile ──────────────────────────────────────────────────────────

export function migrateDataFile(file: DataFile): DataFile {
  if (file.version === 1) {
    return file;
  }
  // Exhaustiveness guard — TypeScript will error here when a new version
  // is added to the DataFile union without a migration branch.
  const _exhaustive: never = file.version;
  return _exhaustive;
}
