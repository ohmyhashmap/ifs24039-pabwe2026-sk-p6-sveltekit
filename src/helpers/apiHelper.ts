export type ApiStatus = "success" | "fail" | "error";

export interface ApiResponse<T = Record<string, any>> {
  status: ApiStatus;
  message: string;
  data?: T;
}

interface RequestOptions {
  body?: unknown;
  form?: FormData;
  query?: Record<string, string | number | undefined>;
  auth?: boolean;
}

export const TOKEN_KEY = "delcom_token";

export const getBaseUrl = (): string =>
  (import.meta.env.VITE_DELCOM_BASEURL ?? "").replace(/\/+$/, "");

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => localStorage.setItem(TOKEN_KEY, token);
export const clearToken = (): void => localStorage.removeItem(TOKEN_KEY);

function buildUrl(path: string, query?: RequestOptions["query"]): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return `${getBaseUrl()}${path}${qs ? `?${qs}` : ""}`;
}

async function request<T>(
  method: string,
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const headers: Record<string, string> = { Accept: "application/json" };
  const token = getToken();
  if (options.auth !== false && token) headers.Authorization = `Bearer ${token}`;

  let body: BodyInit | undefined;
  if (options.form) {
    body = options.form;
  } else if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(buildUrl(path, options.query), { method, headers, body });
    const json = await response.json().catch(() => null);
    if (json && typeof json.status === "string") return json as ApiResponse<T>;
    return { status: "error", message: `Respons server tidak valid (${response.status})` };
  } catch {
    return { status: "error", message: "Tidak dapat terhubung ke server" };
  }
}

export const apiHelper = {
  get: <T>(path: string, options?: RequestOptions) => request<T>("GET", path, options),
  post: <T>(path: string, options?: RequestOptions) => request<T>("POST", path, options),
  put: <T>(path: string, options?: RequestOptions) => request<T>("PUT", path, options),
  delete: <T>(path: string, options?: RequestOptions) => request<T>("DELETE", path, options),
};

/** Mengambil pesan galat paling informatif (pesan validasi pertama atau pesan umum). */
export function getErrorMessage(response: ApiResponse<any>): string {
  const first = Object.values(response.data ?? {})
    .flat()
    .find((value) => typeof value === "string");
  return (first as string | undefined) ?? response.message;
}
