export type IconSource =
  | "built_in"
  | "user_uploaded"
  | "ai_generated";

export interface IconRecord {
  icon_id: string;
  name: string;
  source: IconSource;
  category?: string | null;
  tags: string[];
  style?: string | null;
  description?: string | null;
  mime_type: string;
  version: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  metadata: Record<string, unknown>;
}

import { authorizedFetch, getAuthHeaders } from "./authApi";
import { getApiBaseUrl } from "./apiBase";

function headers(): HeadersInit {
  return { ...getAuthHeaders() };
}

async function readResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let detail = "Icon Library request failed.";
    try {
      const payload = await response.json();
      detail = payload.detail || payload.error || detail;
    } catch {
      // Keep the stable fallback when the backend does not return JSON.
    }
    throw new Error(detail);
  }
  return response.json() as Promise<T>;
}

export async function listLibraryIcons(options: {
  text?: string;
  category?: string;
  source?: IconSource;
} = {}): Promise<IconRecord[]> {
  const params = new URLSearchParams();
  if (options.text) params.set("text", options.text);
  if (options.category) params.set("category", options.category);
  if (options.source) params.set("source", options.source);
  params.set("limit", "200");
  const response = await authorizedFetch(
    `${getApiBaseUrl()}/api/icon-library/icons?${params.toString()}`,
    { headers: headers() },
  );
  return readResponse<IconRecord[]>(response);
}

export async function uploadLibraryIcon(
  file: File,
  fields: {
    name: string;
    category?: string;
    tags?: string[];
    style?: string;
    description?: string;
  },
): Promise<IconRecord> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  const response = await authorizedFetch(`${getApiBaseUrl()}/api/icon-library/icons`, {
    method: "POST",
    headers: {
      ...headers(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...fields,
      source: "user_uploaded",
      svg_content_base64: btoa(binary),
    }),
  });
  return readResponse<IconRecord>(response);
}

export async function updateLibraryIcon(
  iconId: string,
  fields: Partial<Pick<IconRecord, "name" | "category" | "tags" | "style" | "description" | "metadata">>,
): Promise<IconRecord> {
  const response = await authorizedFetch(
    `${getApiBaseUrl()}/api/icon-library/icons/${encodeURIComponent(iconId)}`,
    {
      method: "PATCH",
      headers: {
        ...headers(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fields),
    },
  );
  return readResponse<IconRecord>(response);
}

export async function deleteLibraryIcon(iconId: string): Promise<void> {
  const response = await authorizedFetch(
    `${getApiBaseUrl()}/api/icon-library/icons/${encodeURIComponent(iconId)}`,
    { method: "DELETE", headers: headers() },
  );
  if (!response.ok) {
    await readResponse<unknown>(response);
  }
}

export function libraryIconDownloadUrl(iconId: string): string {
  return `${getApiBaseUrl()}/api/icon-library/icons/${encodeURIComponent(iconId)}/download`;
}
