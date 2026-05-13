import type { ReactNode } from "react";
import { DataFileProvider } from "@/components/data/DataFileProvider";
import { DemoBanner } from "@/components/demo/DemoBanner";

export default function DemoLayout({ children }: { children: ReactNode }) {
  return (
    <DataFileProvider initialMode="demo">
      <DemoBanner />
      {children}
    </DataFileProvider>
  );
}
