import { describe, it, expect } from "vitest";
import { getDemoDataFile } from "./demoData";
import { parseDataFile } from "./schema";

describe("getDemoDataFile", () => {
  it("produces a DataFile that round-trips through parseDataFile", () => {
    const file = getDemoDataFile();
    const reparsed = parseDataFile(JSON.stringify(file));
    expect(reparsed).toEqual(file);
  });

  it("yields exactly 3 month keys", () => {
    const file = getDemoDataFile();
    expect(Object.keys(file.months)).toHaveLength(3);
  });

  it("month keys match YYYY-MM and span current + 2 prior months", () => {
    const file = getDemoDataFile();
    const keys = Object.keys(file.months).sort();
    expect(keys).toHaveLength(3);
    for (const key of keys) {
      expect(key).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    }
  });

  it("includes two people and at least 4 expense categories per month", () => {
    const file = getDemoDataFile();
    expect(file.people).toHaveLength(2);
    for (const month of Object.values(file.months)) {
      const categories = new Set(month.expenses.map((e) => e.category));
      expect(categories.size).toBeGreaterThanOrEqual(4);
      expect(month.expenses.length).toBeGreaterThanOrEqual(6);
      expect(month.expenses.length).toBeLessThanOrEqual(10);
    }
  });

  it("has positive amounts only", () => {
    const file = getDemoDataFile();
    for (const month of Object.values(file.months)) {
      for (const entries of Object.values(month.income)) {
        for (const entry of entries) {
          expect(entry.amount).toBeGreaterThan(0);
        }
      }
      for (const entry of month.expenses) {
        expect(entry.amount).toBeGreaterThan(0);
      }
    }
  });
});
