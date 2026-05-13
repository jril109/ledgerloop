"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { signOut } from "next-auth/react";
import type {
  DataFile,
  ExpenseEntry,
  IncomeEntry,
  MonthData,
} from "@/lib/schema";
import { getDemoDataFile } from "@/lib/demoData";
import { saveDataFile } from "@/lib/server/saveDataFile";

type Mode = "demo" | "authenticated";

export type SaveStatus =
  | "idle"
  | "saving"
  | "error-retrying"
  | "error-persistent";

interface DataFileContextValue {
  data: DataFile;
  isDemo: boolean;
  mode: Mode;
  saveStatus: SaveStatus;
  setHouseholdName: (name: string) => void;
  setPersonName: (personId: string, name: string) => void;
  addIncome: (
    monthKey: string,
    personId: string,
    entry: IncomeEntry,
  ) => void;
  updateIncome: (
    monthKey: string,
    personId: string,
    entry: IncomeEntry,
  ) => void;
  removeIncome: (
    monthKey: string,
    personId: string,
    entryId: string,
  ) => void;
  addExpense: (monthKey: string, entry: ExpenseEntry) => void;
  updateExpense: (monthKey: string, entry: ExpenseEntry) => void;
  removeExpense: (monthKey: string, entryId: string) => void;
}

const DataFileContext = createContext<DataFileContextValue | null>(null);

const DEBOUNCE_MS = 500;
const RETRY_BACKOFFS_MS = [500, 1500, 4500] as const;

function emptyMonth(): MonthData {
  return { income: {}, expenses: [] };
}

function ensureMonth(data: DataFile, monthKey: string): DataFile {
  if (data.months[monthKey]) return data;
  return {
    ...data,
    months: { ...data.months, [monthKey]: emptyMonth() },
  };
}

function handleRevoked(): void {
  void signOut({ redirectTo: "/sign-in?error=revoked" });
}

interface DataFileProviderProps {
  children: ReactNode;
  initialMode: Mode;
  initialData?: DataFile;
}

export function DataFileProvider({
  children,
  initialMode,
  initialData,
}: DataFileProviderProps) {
  const [data, setData] = useState<DataFile>(() => {
    if (initialData) return initialData;
    if (initialMode === "demo") return getDemoDataFile();
    return {
      version: 1,
      householdName: "",
      people: [],
      months: {},
      preferences: {},
      tier: "free",
    };
  });

  const isDemo = initialMode === "demo";
  const isAuthenticated = initialMode === "authenticated";

  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");

  const latestDataRef = useRef<DataFile>(data);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const savingRef = useRef<boolean>(false);
  const unmountedRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
    };
  }, []);

  const performSave = useCallback(async (): Promise<void> => {
    if (savingRef.current) return;
    savingRef.current = true;

    let snapshot = latestDataRef.current;
    let retries = 0;
    setSaveStatus("saving");

    try {
      while (true) {
        let result: Awaited<ReturnType<typeof saveDataFile>>;
        try {
          result = await saveDataFile(snapshot);
        } catch {
          result = { ok: false, reason: "network" };
        }

        if (result.ok) {
          if (latestDataRef.current !== snapshot) {
            snapshot = latestDataRef.current;
            retries = 0;
            if (!unmountedRef.current) setSaveStatus("saving");
            continue;
          }
          if (!unmountedRef.current) setSaveStatus("idle");
          return;
        }

        if (result.reason === "invalid") {
          throw new Error(
            "saveDataFile rejected the current DataFile as invalid",
          );
        }

        if (result.reason === "revoked" || result.reason === "unauthenticated") {
          handleRevoked();
          return;
        }

        retries += 1;
        if (retries > RETRY_BACKOFFS_MS.length) {
          if (!unmountedRef.current) setSaveStatus("error-persistent");
          return;
        }

        if (!unmountedRef.current) setSaveStatus("error-retrying");
        const backoff = RETRY_BACKOFFS_MS[retries - 1];
        await new Promise<void>((resolve) => setTimeout(resolve, backoff));
        if (unmountedRef.current) return;
        snapshot = latestDataRef.current;
      }
    } finally {
      savingRef.current = false;
    }
  }, []);

  const scheduleSave = useCallback(
    (next: DataFile): void => {
      latestDataRef.current = next;
      if (!isAuthenticated) return;

      if (debounceTimerRef.current !== null) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        debounceTimerRef.current = null;
        void performSave();
      }, DEBOUNCE_MS);
    },
    [isAuthenticated, performSave],
  );

  const applyMutation = useCallback(
    (updater: (prev: DataFile) => DataFile) => {
      setData((prev) => {
        const next = updater(prev);
        if (next !== prev) scheduleSave(next);
        return next;
      });
    },
    [scheduleSave],
  );

  const setHouseholdName = useCallback(
    (name: string) => {
      applyMutation((prev) => ({ ...prev, householdName: name }));
    },
    [applyMutation],
  );

  const setPersonName = useCallback(
    (personId: string, name: string) => {
      applyMutation((prev) => ({
        ...prev,
        people: prev.people.map((p) =>
          p.id === personId ? { ...p, name } : p,
        ),
      }));
    },
    [applyMutation],
  );

  const addIncome = useCallback(
    (monthKey: string, personId: string, entry: IncomeEntry) => {
      applyMutation((prev) => {
        const next = ensureMonth(prev, monthKey);
        const month = next.months[monthKey];
        const existing = month.income[personId] ?? [];
        return {
          ...next,
          months: {
            ...next.months,
            [monthKey]: {
              ...month,
              income: {
                ...month.income,
                [personId]: [...existing, entry],
              },
            },
          },
        };
      });
    },
    [applyMutation],
  );

  const updateIncome = useCallback(
    (monthKey: string, personId: string, entry: IncomeEntry) => {
      applyMutation((prev) => {
        const month = prev.months[monthKey];
        if (!month) return prev;
        const existing = month.income[personId] ?? [];
        return {
          ...prev,
          months: {
            ...prev.months,
            [monthKey]: {
              ...month,
              income: {
                ...month.income,
                [personId]: existing.map((e) =>
                  e.id === entry.id ? entry : e,
                ),
              },
            },
          },
        };
      });
    },
    [applyMutation],
  );

  const removeIncome = useCallback(
    (monthKey: string, personId: string, entryId: string) => {
      applyMutation((prev) => {
        const month = prev.months[monthKey];
        if (!month) return prev;
        const existing = month.income[personId] ?? [];
        return {
          ...prev,
          months: {
            ...prev.months,
            [monthKey]: {
              ...month,
              income: {
                ...month.income,
                [personId]: existing.filter((e) => e.id !== entryId),
              },
            },
          },
        };
      });
    },
    [applyMutation],
  );

  const addExpense = useCallback(
    (monthKey: string, entry: ExpenseEntry) => {
      applyMutation((prev) => {
        const next = ensureMonth(prev, monthKey);
        const month = next.months[monthKey];
        return {
          ...next,
          months: {
            ...next.months,
            [monthKey]: {
              ...month,
              expenses: [...month.expenses, entry],
            },
          },
        };
      });
    },
    [applyMutation],
  );

  const updateExpense = useCallback(
    (monthKey: string, entry: ExpenseEntry) => {
      applyMutation((prev) => {
        const month = prev.months[monthKey];
        if (!month) return prev;
        return {
          ...prev,
          months: {
            ...prev.months,
            [monthKey]: {
              ...month,
              expenses: month.expenses.map((e) =>
                e.id === entry.id ? entry : e,
              ),
            },
          },
        };
      });
    },
    [applyMutation],
  );

  const removeExpense = useCallback(
    (monthKey: string, entryId: string) => {
      applyMutation((prev) => {
        const month = prev.months[monthKey];
        if (!month) return prev;
        return {
          ...prev,
          months: {
            ...prev.months,
            [monthKey]: {
              ...month,
              expenses: month.expenses.filter((e) => e.id !== entryId),
            },
          },
        };
      });
    },
    [applyMutation],
  );

  const value = useMemo<DataFileContextValue>(
    () => ({
      data,
      isDemo,
      mode: initialMode,
      saveStatus,
      setHouseholdName,
      setPersonName,
      addIncome,
      updateIncome,
      removeIncome,
      addExpense,
      updateExpense,
      removeExpense,
    }),
    [
      data,
      isDemo,
      initialMode,
      saveStatus,
      setHouseholdName,
      setPersonName,
      addIncome,
      updateIncome,
      removeIncome,
      addExpense,
      updateExpense,
      removeExpense,
    ],
  );

  return (
    <DataFileContext.Provider value={value}>
      {children}
    </DataFileContext.Provider>
  );
}

export function useDataFile(): DataFileContextValue {
  const ctx = useContext(DataFileContext);
  if (!ctx) {
    throw new Error("useDataFile must be used within a <DataFileProvider>");
  }
  return ctx;
}
