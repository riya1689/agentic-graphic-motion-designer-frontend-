import { authorizedFetch, type AuthUser } from "./authApi";
import { getApiBaseUrl } from "./apiBase";

export type ManagedUser = AuthUser;

export async function listManagedUsers(): Promise<ManagedUser[]> {
  const response = await authorizedFetch(`${getApiBaseUrl()}/api/auth/admin/users`);
  return readResponse<ManagedUser[]>(response);
}

export async function createManagedUser(input: {
  email: string;
  display_name: string;
  temporary_password: string;
  roles: string[];
}): Promise<ManagedUser> {
  const response = await authorizedFetch(`${getApiBaseUrl()}/api/auth/admin/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return readResponse<ManagedUser>(response);
}

export async function setManagedUserStatus(
  userId: string,
  status: "active" | "disabled" | "pending",
): Promise<ManagedUser> {
  const response = await authorizedFetch(
    `${getApiBaseUrl()}/api/auth/admin/users/${encodeURIComponent(userId)}/status`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  return readResponse<ManagedUser>(response);
}

export async function resetManagedUserPassword(
  userId: string,
  temporaryPassword: string,
): Promise<ManagedUser> {
  const response = await authorizedFetch(
    `${getApiBaseUrl()}/api/auth/admin/users/${encodeURIComponent(userId)}/reset-password`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ temporary_password: temporaryPassword }),
    },
  );
  return readResponse<ManagedUser>(response);
}

async function readResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(String(payload.detail || "Admin request failed."));
  }
  return payload as T;
}
