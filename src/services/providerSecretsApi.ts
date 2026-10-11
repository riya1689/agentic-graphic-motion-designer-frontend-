import { authorizedFetch } from "./authApi";
import { getApiBaseUrl } from "./apiBase";

export interface ProviderSecretSummary {
  provider: string;
  secret_name: string;
  masked_value: string;
  is_active: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

export async function listProviderSecrets(): Promise<ProviderSecretSummary[]> {
  const response = await authorizedFetch(
    `${getApiBaseUrl()}/api/admin/provider-secrets`,
  );
  return readResponse<ProviderSecretSummary[]>(response);
}

export async function saveProviderSecret(
  provider: string,
  value: string,
  secretName = "api_key",
): Promise<ProviderSecretSummary> {
  const response = await authorizedFetch(
    `${getApiBaseUrl()}/api/admin/provider-secrets/${encodeURIComponent(provider)}`,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret_name: secretName, value }),
    },
  );
  return readResponse<ProviderSecretSummary>(response);
}

export async function revokeProviderSecret(
  provider: string,
  secretName = "api_key",
): Promise<void> {
  const response = await authorizedFetch(
    `${getApiBaseUrl()}/api/admin/provider-secrets/${encodeURIComponent(provider)}/${encodeURIComponent(secretName)}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    throw new Error(await responseError(response));
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(payload.detail || "Provider settings request failed."));
  }
  return payload as T;
}

async function responseError(response: Response): Promise<string> {
  const payload = await response.json().catch(() => ({}));
  return String(payload.detail || "Provider settings request failed.");
}
