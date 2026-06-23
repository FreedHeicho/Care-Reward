import React, { createContext, useContext, useState, ReactNode } from "react";

export interface HealthSystem {
  id: string;
  name: string;
  type: "Hospital" | "Health System" | "Clinic" | "Pharmacy" | "Provider";
  location: string;
  connectedAt: string;
  lastSynced: string;
  status: "connected" | "syncing";
}

interface HealthRecordsContextType {
  connectedSystems: HealthSystem[];
  addSystem: (system: HealthSystem) => void;
  removeSystem: (id: string) => void;
}

const HealthRecordsContext = createContext<HealthRecordsContextType | null>(null);

export function HealthRecordsProvider({ children }: { children: ReactNode }) {
  const [connectedSystems, setConnectedSystems] = useState<HealthSystem[]>([]);

  const addSystem = (system: HealthSystem) => {
    setConnectedSystems((prev) => {
      if (prev.find((s) => s.id === system.id)) return prev;
      return [...prev, system];
    });
  };

  const removeSystem = (id: string) => {
    setConnectedSystems((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <HealthRecordsContext.Provider value={{ connectedSystems, addSystem, removeSystem }}>
      {children}
    </HealthRecordsContext.Provider>
  );
}

export function useHealthRecords() {
  const ctx = useContext(HealthRecordsContext);
  if (!ctx) throw new Error("useHealthRecords must be used within HealthRecordsProvider");
  return ctx;
}
