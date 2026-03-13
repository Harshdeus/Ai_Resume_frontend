import { getAuthHeaders, removeToken } from "./auth";

const BACKEND_URL = "http://127.0.0.1:8000";

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    ...getAuthHeaders(),
    ...((options.headers as Record<string, string>) || {}),
  };

  const response = await fetch(`${BACKEND_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    removeToken();
    window.location.href = "/";
    throw new Error("Unauthorized");
  }

  return response;
}

export async function apiJsonFetch(endpoint: string, options: RequestInit = {}) {
  const response = await apiFetch(endpoint, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    },
  });

  return response;
}