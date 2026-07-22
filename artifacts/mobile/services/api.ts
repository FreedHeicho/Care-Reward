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
