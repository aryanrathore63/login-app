const BASE = import.meta.env.VITE_API_URL ?? "";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(BASE + path, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(res.status, data.error ?? "Request failed");
  return data as T;
}

export const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e.trim());

export const register = (body: { email: string; firstName: string; lastName: string }) =>
  request<{ code: string }>("/api/register", { method: "POST", body: JSON.stringify(body) });

export const checkEmail = (email: string) =>
  request<{ exists: boolean }>(`/api/users/check?email=${encodeURIComponent(email)}`);

export const login = (body: { email: string; code: string }) =>
  request<{ token: string; user: { firstName: string; lastName: string } }>("/api/login", {
    method: "POST",
    body: JSON.stringify(body),
  });

export const submitCheckout = (
  body: { email: string; phone: string; shippingAddress: string },
  token?: string
) =>
  request<{ id: string }>("/api/checkout", {
    method: "POST",
    body: JSON.stringify(body),
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
