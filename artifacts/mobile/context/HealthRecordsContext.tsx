import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { healthSystemsApi, ConnectedHealthSystem } from "@/services/api";
import { getStoredToken } from "@/services/api";

export interface HealthSystem {
  id: string;
  name: string;
  type: "Hospital" | "Health System" | "Clinic" | "Pharmacy" | "Provider";
  location: string;
  connectedAt: string;
  lastSynced: string;
  status: "connected" | "syncing";
  npi?: string | null;
}

const DB_TYPE_TO_UI: Record<string, HealthSystem["type"]> = {
  HOSPITAL: "Hospital",
  CLINIC: "Clinic",
  PHARMACY: "Pharmacy",
  PROVIDER: "Provider",
};

function toUiSystem(s: ConnectedHealthSystem): HealthSystem {
  return {
    id: s.id,
    name: s.systemName,
    type: DB_TYPE_TO_UI[s.systemType] ?? "Provider",
    location: "",
    connectedAt: s.createdAt
      ? new Date(s.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    lastSynced: s.lastSyncedAt
      ? new Date(s.lastSyncedAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "",
    status: s.connectionStatus === "CONNECTED" ? "connected" : "syncing",
    npi: s.npi,
  };
}

interface HealthRecordsContextType {
  connectedSystems: HealthSystem[];
  loading: boolean;
  addSystem: (params: {
    systemName: string;
    systemType: string;
    npi?: string;
  }) => Promise<HealthSystem>;
  removeSystem: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const HealthRecordsContext = createContext<HealthRecordsContextType | null>(null);

export function HealthRecordsProvider({ children }: { children: ReactNode }) {
  const [connectedSystems, setConnectedSystems] = useState<HealthSystem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    const token = await getStoredToken();
    if (!token) return;
    try {
      const systems = await healthSystemsApi.list();
      setConnectedSystems(systems.map(toUiSystem));
    } catch {
      // silently fail — user may not be authenticated yet
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addSystem = async (params: {
    systemName: string;
    systemType: string;
    npi?: string;
  }): Promise<HealthSystem> => {
    const created = await healthSystemsApi.connect(params);
    const ui = toUiSystem(created);
    setConnectedSystems((prev) => {
      if (prev.find((s) => s.id === ui.id)) return prev;
      return [...prev, ui];
    });
    return ui;
  };

  const removeSystem = async (id: string): Promise<void> => {
    await healthSystemsApi.remove(id);
    setConnectedSystems((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <HealthRecordsContext.Provider
      value={{ connectedSystems, loading, addSystem, removeSystem, refresh }}
    >
      {children}
    </HealthRecordsContext.Provider>
  );
}

export function useHealthRecords() {
  const ctx = useContext(HealthRecordsContext);
  if (!ctx) throw new Error("useHealthRecords must be used within HealthRecordsProvider");
  return ctx;
}
