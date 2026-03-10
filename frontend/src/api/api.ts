type RequestOptions = {
  method?: "GET" | "POST";
  body?: unknown;
  token?: string;
};

const request = async <T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> => {
  const response = await fetch(endpoint, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      ...(options.token
        ? { Authorization: `Bearer ${options.token}` }
        : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const data = (await response.json().catch(() => ({}))) as {
    message?: string;
  } & T;

  if (!response.ok) {
    throw new Error(data.message ?? "Request failed");
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
  return request<{ token: string; user: { id: string; email: string } }>(
    "/auth/login",
    {
      method: "POST",
      body: { email, password },
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
