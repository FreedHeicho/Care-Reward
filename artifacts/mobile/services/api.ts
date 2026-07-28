import AsyncStorage from "@react-native-async-storage/async-storage";

const DOMAIN = process.env.EXPO_PUBLIC_DOMAIN;
const BASE_URL = DOMAIN ? `https://${DOMAIN}/api` : "/api";

const KEYS = {
  token: "@cr_token",
};

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export async function getStoredToken(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.token);
}

export async function storeToken(token: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.token, token);
}

export async function clearStoredToken(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.token);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  requiresAuth = true,
): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (requiresAuth) {
    const token = await getStoredToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });

  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      msg = body.error ?? body.message ?? msg;
    } catch {}
    throw new ApiError(res.status, msg);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ accessToken: string; refreshToken: string; user: ApiUser }>(
      "/auth/login",
      { method: "POST", body: JSON.stringify({ email, password }) },
      false,
    ),

  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) =>
    request<{ accessToken: string; refreshToken: string; user: ApiUser }>(
      "/auth/register",
      {
        method: "POST",
        body: JSON.stringify({ email, password, firstName, lastName }),
      },
      false,
    ),
};

export interface ConnectedHealthSystem {
  id: string;
  userId: string;
  systemName: string;
  systemType: "HOSPITAL" | "CLINIC" | "PHARMACY" | "PROVIDER";
  npi: string | null;
  fhirBaseUrl: string | null;
  connectionStatus: "CONNECTED" | "DISCONNECTED" | "PENDING" | "ERROR";
  lastSyncedAt: string | null;
  createdAt: string;
}

export const healthSystemsApi = {
  list: () => request<ConnectedHealthSystem[]>("/health-systems"),

  connect: (params: {
    systemName: string;
    systemType: string;
    npi?: string;
    fhirBaseUrl?: string;
  }) =>
    request<ConnectedHealthSystem>("/health-systems", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  remove: (id: string) =>
    request<{ success: boolean }>(`/health-systems/${id}`, {
      method: "DELETE",
    }),
};

export const userApi = {
  getContext: () => request<UserContextResponse>("/user/context"),
  getOpportunities: (status?: string) =>
    request<ApiOpportunity[]>(
      `/user/opportunities${status ? `?status=${status}` : ""}`,
    ),
};

export const pointsApi = {
  getBalance: () => request<PointsBalanceResponse>("/points/balance"),
};

// ── Connected Devices ─────────────────────────────────────────────────────────

export interface ConnectedDevice {
  id: string;
  userId: string;
  deviceType: "BLOOD_PRESSURE" | "GLUCOSE" | "OXYGEN" | "HEART_RATE" | "STRESS";
  deviceName: string;
  deviceModel: string | null;
  manufacturer: string | null;
  connectionType: "BLUETOOTH" | "WIFI" | "NFC";
  macAddress: string | null;
  isActive: boolean;
  lastConnectedAt: string | null;
  createdAt: string;
  alreadyConnected?: boolean;
}

export const devicesApi = {
  list: () => request<ConnectedDevice[]>("/user/devices"),

  connect: (params: {
    deviceType: string;
    deviceName: string;
    deviceModel?: string;
    manufacturer?: string;
    connectionType: string;
  }) =>
    request<ConnectedDevice>("/user/devices", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  disconnect: (id: string) =>
    request<{ success: boolean }>(`/user/devices/${id}`, { method: "DELETE" }),
};

// ── Device Readings ───────────────────────────────────────────────────────────

export interface DeviceReading {
  id: string;
  userId: string;
  deviceId: string;
  metricType: string;
  value: string;
  unit: string;
  recordedAt: string;
  syncedAt: string;
  isFlagged: boolean;
  deviceName?: string;
  deviceType?: string;
}

export const deviceReadingsApi = {
  list: (params?: { deviceId?: string; metricType?: string; limit?: number }) => {
    const qs = new URLSearchParams();
    if (params?.deviceId) qs.set("deviceId", params.deviceId);
    if (params?.metricType) qs.set("metricType", params.metricType);
    if (params?.limit) qs.set("limit", String(params.limit));
    const query = qs.toString() ? `?${qs}` : "";
    return request<DeviceReading[]>(`/user/device-readings${query}`);
  },

  log: (params: {
    deviceId: string;
    metricType: string;
    value: number;
    unit: string;
    recordedAt?: string;
    isFlagged?: boolean;
  }) =>
    request<DeviceReading>("/user/device-readings", {
      method: "POST",
      body: JSON.stringify(params),
    }),
};

// ── Copay Records ─────────────────────────────────────────────────────────────

export interface CopayRecord {
  id: string;
  userId: string;
  providerName: string | null;
  amountDue: string;
  visitDate: string;
  status: string;
  emrRecordId: string | null;
  createdAt: string;
}

export const copayApi = {
  list: () => request<CopayRecord[]>("/user/copay"),

  create: (params: {
    providerName?: string;
    amountDue: number;
    visitDate: string;
    status?: string;
    emrRecordId?: string;
  }) =>
    request<CopayRecord>("/user/copay", {
      method: "POST",
      body: JSON.stringify(params),
    }),

  updateStatus: (id: string, status: string) =>
    request<CopayRecord>(`/user/copay/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
};

// ── EMR Records ───────────────────────────────────────────────────────────────

export interface EmrRecord {
  id: string;
  userId: string;
  healthSystemId: string;
  recordType: "IMMUNIZATION" | "VISIT" | "LAB_RESULT" | "MEDICATION";
  fhirResourceType: string;
  fhirResourceId: string;
  loincCode: string | null;
  icd10Code: string | null;
  cvxCode: string | null;
  rawData: Record<string, unknown>;
  displayData: Record<string, unknown>;
  recordDate: string;
  createdAt: string;
  updatedAt: string;
}

export const emrApi = {
  // Existing read endpoint (by type)
  getByType: (recordType: "IMMUNIZATION" | "VISIT" | "LAB_RESULT" | "MEDICATION") =>
    request<EmrRecord[]>(`/user/emr/${recordType}`),

  // New write endpoint — sync records from a connected health system
  syncRecords: (params: {
    healthSystemId: string;
    records: Array<{
      recordType: string;
      fhirResourceType: string;
      fhirResourceId: string;
      loincCode?: string;
      icd10Code?: string;
      cvxCode?: string;
      rawData: Record<string, unknown>;
      displayData: Record<string, unknown>;
      recordDate: string;
    }>;
  }) =>
    request<{ inserted: number; records: EmrRecord[] }>("/user/emr", {
      method: "POST",
      body: JSON.stringify(params),
    }),
};

// ── Push Tokens ───────────────────────────────────────────────────────────────

export const pushTokensApi = {
  register: (token: string, platform: "IOS" | "ANDROID") =>
    request<{ id: string; token: string; platform: string; isActive: boolean }>(
      "/user/push-token",
      { method: "POST", body: JSON.stringify({ token, platform }) },
    ),

  deactivate: () =>
    request<{ success: boolean }>("/user/push-token", { method: "DELETE" }),
};

export interface ApiUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface ApiOpportunity {
  id: string;
  opportunityId: string;
  status: string;
  assignedAt: string;
  opportunity: {
    id: string;
    title: string;
    description: string;
    category: string;
    subCategory?: string | null;
    pointsValue: number;
    isActive: boolean;
  };
}

export interface PointsAccountData {
  id: string;
  currentBalance: number;
  earnedThisYear: number;
  yearResetDate: string;
}

export interface RedemptionWindowData {
  id: string;
  windowStart: string;
  windowEnd: string;
  isActive: boolean;
}

export interface InsurancePlanData {
  id: string;
  planName: string;
  monthlyPremium: string;
  deductible: string;
  effectiveDate: string;
  expirationDate: string;
}

export interface UserContextResponse {
  user: ApiUser;
  points: {
    account: PointsAccountData | null;
    recentTransactions: unknown[];
  };
  activeRedemptionWindow: RedemptionWindowData | null;
  hsaAccount: {
    id: string;
    yearlyLimit: string;
    ytdContribution: string;
    currentBalance: string;
  } | null;
  insurancePlan: InsurancePlanData | null;
}

export interface PointsBalanceResponse {
  balance: number;
  earnedThisYear: number;
  pendingBalance: number;
}
