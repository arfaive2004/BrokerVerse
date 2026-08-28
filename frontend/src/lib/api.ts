// Base URL of the BrokerVerse FastAPI backend.
// Set NEXT_PUBLIC_API_URL in Vercel without a trailing slash.
export const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

const TOKEN_KEY = "brokerverse_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  if (typeof window === "undefined") return;

  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(TOKEN_KEY);
}

type ApiFetchOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
};

/**
 * Sends a request to the BrokerVerse backend.
 *
 * - Automatically uses NEXT_PUBLIC_API_URL
 * - Automatically attaches the logged-in user's Bearer token
 * - Automatically JSON-stringifies plain object bodies
 * - Leaves FormData untouched for file uploads
 */
export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {}
): Promise<Response> {
  const token = getToken();

  const headers = new Headers(options.headers);

  let body = options.body as BodyInit | null | undefined;

  const isFormData =
    typeof FormData !== "undefined" &&
    body instanceof FormData;

  if (
    body &&
    !isFormData &&
    typeof body === "object"
  ) {
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }

    body = JSON.stringify(body);
  }

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    body,
  });
}

/**
 * Same as apiFetch, but automatically parses JSON
 * and throws a useful error for failed requests.
 */
export async function apiJson<T>(
  path: string,
  options: ApiFetchOptions = {}
): Promise<T> {
  const response = await apiFetch(path, options);

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      data?.detail ||
      data?.reason ||
      data?.message ||
      `Request failed (${response.status})`;

    throw new Error(
      typeof message === "string"
        ? message
        : "Request failed"
    );
  }

  return data as T;
}