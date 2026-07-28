import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { devicesApi, ConnectedDevice } from "@/services/api";
import { getStoredToken } from "@/services/api";

interface ConnectedDevicesContextType {
  devices: ConnectedDevice[];
  loading: boolean;
  addDevice: (params: {
    deviceType: string;
    deviceName: string;
    deviceModel?: string;
    manufacturer?: string;
    connectionType: string;
  }) => Promise<ConnectedDevice>;
  removeDevice: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

const ConnectedDevicesContext = createContext<ConnectedDevicesContextType | null>(null);

export function ConnectedDevicesProvider({ children }: { children: ReactNode }) {
  const [devices, setDevices] = useState<ConnectedDevice[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = await getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await devicesApi.list();
      setDevices(list);
    } catch {
      // silently fail — user may not be authenticated yet
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDevice = async (params: {
    deviceType: string;
    deviceName: string;
    deviceModel?: string;
    manufacturer?: string;
    connectionType: string;
  }): Promise<ConnectedDevice> => {
    const created = await devicesApi.connect(params);
    setDevices((prev) => {
      if (prev.find((d) => d.id === created.id)) {
        // already connected — update lastConnectedAt
        return prev.map((d) => (d.id === created.id ? created : d));
      }
      return [...prev, created];
    });
    return created;
  };

  const removeDevice = async (id: string): Promise<void> => {
    await devicesApi.disconnect(id);
    setDevices((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <ConnectedDevicesContext.Provider
      value={{ devices, loading, addDevice, removeDevice, refresh }}
    >
      {children}
    </ConnectedDevicesContext.Provider>
  );
}

export function useConnectedDevices() {
  const ctx = useContext(ConnectedDevicesContext);
  if (!ctx) throw new Error("useConnectedDevices must be used within ConnectedDevicesProvider");
  return ctx;
}
