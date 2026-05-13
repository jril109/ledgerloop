"use client";

import { useState } from "react";
import type { DataFile, MonthData } from "@/lib/schema";
import { DataFileProvider, useDataFile } from "@/components/data/DataFileProvider";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { IncomeTracker } from "@/components/income/IncomeTracker";

interface AuthenticatedDashboardProps {
  initialData: DataFile;
  activeMonth: string;
  availableMonths: string[];
}

function emptyMonth(): MonthData {
  return { income: {}, expenses: [] };
}

function DashboardBody({
  activeMonth,
  availableMonths,
}: {
  activeMonth: string;
  availableMonths: string[];
}) {
  const { data } = useDataFile();
  const [selectedMonth, setSelectedMonth] = useState<string>(activeMonth);
  const monthData = data.months[selectedMonth] ?? emptyMonth();
  const householdName = data.householdName || "Your household";

  return (
    <>
      <DashboardView
        monthData={monthData}
        availableMonths={availableMonths}
        activeMonth={activeMonth}
        householdName={householdName}
        selectedMonth={selectedMonth}
        onSelectedMonthChange={setSelectedMonth}
      />
      <div className="mx-auto w-full max-w-2xl px-4 pb-10 sm:px-6">
        <IncomeTracker monthKey={selectedMonth} />
      </div>
    </>
  );
}

export function AuthenticatedDashboard({
  initialData,
  activeMonth,
  availableMonths,
}: AuthenticatedDashboardProps) {
  return (
    <DataFileProvider initialMode="authenticated" initialData={initialData}>
      <DashboardBody
        activeMonth={activeMonth}
        availableMonths={availableMonths}
      />
    </DataFileProvider>
  );
}
