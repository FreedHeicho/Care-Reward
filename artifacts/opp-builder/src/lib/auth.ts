import { setAuthTokenGetter } from "@workspace/api-client-react";

const TOKEN_KEY = "accessToken";

export function initializeAuth() {
  setAuthTokenGetter(() => localStorage.getItem(TOKEN_KEY));
}

export function setAuthToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAuthToken();
}
