// In production (Amplify), set VITE_API_BASE_URL to your App Runner URL.
// Locally, it's empty so Vite proxy handles it.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "";

type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string;
};

const request = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  let response = await fetch(`${API_BASE}${endpoint}`, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token
        ? { Authorization: `Bearer ${options.token}` }
        : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (response.status === 401 && options.token) {
    const refreshToken = localStorage.getItem("refreshToken");
    if (refreshToken) {
      try {
        const refreshResponse = await fetch(`${API_BASE}/auth/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ grant_type: "refresh_token", refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          localStorage.setItem("token", refreshData.access_token);
          localStorage.setItem("refreshToken", refreshData.refresh_token);

          // Retry the original request
          options.token = refreshData.access_token;
          response = await fetch(`${API_BASE}${endpoint}`, {
            method: options.method ?? "GET",
            headers: {
              "Content-Type": "application/json",
              ...(options.token
                ? { Authorization: `Bearer ${options.token}` }
                : {}),
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
          });
        }
      } catch (err) {
        // Exiting silently here, allowing original 401 logic to throw
      }
    }
  }

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
    error_description?: string;
  } & T;

  if (!response.ok) {
    throw new Error(data.error_description ?? data.message ?? "Request failed");
  }

  return data;
};

export const signup = (email: string, password: string) => {
  return request<{ message: string }>("/auth/signup", {
    method: "POST",
    body: { email, password },
  });
};

export const login = (email: string, password: string) => {
  return request<{ access_token: string; refresh_token: string; user: { id: string; email: string } }>(
    "/auth/token",
    {
      method: "POST",
      body: { grant_type: "password", email, password },
    }
  );
};

export type UrlItem = {
  id: string;
  originalUrl: string;
  shortCode: string;
  shortUrl: string;
  clickCount: number;
  createdAt: string;
};

export const createShortUrl = (originalUrl: string, token: string) => {
  return request<UrlItem>("/url/shorten", {
    method: "POST",
    body: { originalUrl },
    token,
  });
};

export const getUserUrls = (token: string) => {
  return request<UrlItem[]>("/url/user", { token });
};
