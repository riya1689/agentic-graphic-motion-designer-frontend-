import { authorizedFetch, getAuthHeaders } from "./authApi";
import { getApiBaseUrl } from "./apiBase";

export interface GoogleDriveStatus {
  enabled: boolean;
  ready: boolean;
  client_configured: boolean;
  connected: boolean;
  folder_configured: boolean;
  folder_id: string;
  client_path: string;
}

async function read<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = "Google Drive request failed.";
    try {
      const payload = await response.json();
      detail = payload.detail || detail;
    } catch {
      // Keep the stable fallback.
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

async function request(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 10000);
  try {
    return await authorizedFetch(input, { ...init, signal: controller.signal });
  } finally {
    window.clearTimeout(timeout);
  }
}

export async function getGoogleDriveStatus(): Promise<GoogleDriveStatus> {
  return read(await request(`${getApiBaseUrl()}/api/icon-library/drive/status`, { headers: getAuthHeaders() }));
}

export async function connectGoogleDrive(): Promise<{ authorization_url: string }> {
  return read(await request(`${getApiBaseUrl()}/api/icon-library/drive/connect`, { method: "POST", headers: getAuthHeaders() }));
}

export async function disconnectGoogleDrive(): Promise<void> {
  const response = await request(`${getApiBaseUrl()}/api/icon-library/drive/disconnect`, { method: "POST", headers: getAuthHeaders() });
  if (!response.ok) await read<unknown>(response);
}
