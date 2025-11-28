const API_BASE_URL =
  import.meta.env.API_BASE_URL || "http://localhost:3001/api";

function buildQueryString(params?: Record<string, any>) {
  if (!params) return "";
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`,
    )
    .join("&");
  return query ? `?${query}` : "";
}

async function request(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg = data?.error || data?.message || "Erro inesperado";
    throw new Error(msg);
  }

  return data;
}

export const api = {
  get: (path: string, params?: Record<string, any>) =>
    request(`${path}${buildQueryString(params)}`, { method: "GET" }),
  
  post: (path: string, body?: any) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),
  
  put: (path: string, body?: any) =>
    request(path, { method: "PUT", body: JSON.stringify(body) }),
  
  delete: (path: string, body?: any) =>
    request(path, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    }),
};
