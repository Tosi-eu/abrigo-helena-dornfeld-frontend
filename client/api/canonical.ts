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

// Sanitize error messages to prevent information disclosure
function sanitizeErrorMessage(message: string): string {
  // Remove potential sensitive information patterns
  const sensitivePatterns = [
    /database/i,
    /sql/i,
    /connection/i,
    /password/i,
    /token/i,
    /secret/i,
    /api[_-]?key/i,
    /file[_-]?path/i,
    /stack[_-]?trace/i,
  ];

  // If message contains sensitive patterns, return generic error
  if (sensitivePatterns.some((pattern) => pattern.test(message))) {
    return "Ocorreu um erro. Por favor, tente novamente.";
  }

  // Limit message length to prevent DoS
  const maxLength = 200;
  if (message.length > maxLength) {
    return message.substring(0, maxLength) + "...";
  }

  return message;
}

async function request(path: string, options: RequestInit = {}) {
  const token = sessionStorage.getItem("token");

  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  if (res.status === 401) {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    window.location.href = "/user/login";
    throw new Error("Sessão expirada");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const rawMsg = data?.error || data?.message || "Erro inesperado";
    const sanitizedMsg = sanitizeErrorMessage(String(rawMsg));
    throw new Error(sanitizedMsg);
  }

  return data;
}

export const api = {
  get: (path: string, options?: { params?: Record<string, any> }) =>
    request(`${path}${buildQueryString(options?.params)}`, { method: "GET" }),

  post: (path: string, body?: any) =>
    request(path, { method: "POST", body: JSON.stringify(body) }),

  put: (path: string, body?: any) =>
    request(path, { method: "PUT", body: JSON.stringify(body) }),

  patch: (path: string, body?: any) =>
    request(path, { method: "PATCH", body: JSON.stringify(body) }),

  delete: (path: string, body?: any) =>
    request(path, {
      method: "DELETE",
      body: body ? JSON.stringify(body) : undefined,
    }),
};
