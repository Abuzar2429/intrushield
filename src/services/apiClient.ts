// API client for IntruShield frontend

const API_BASE = '/api';

export function getStoredToken(): string | null {
  return localStorage.getItem('intrushield_token');
}

export function setStoredToken(token: string) {
  localStorage.setItem('intrushield_token', token);
}

export function clearStoredToken() {
  localStorage.removeItem('intrushield_token');
  localStorage.removeItem('intrushield_user');
}

export function getStoredUser(): any | null {
  const userStr = localStorage.getItem('intrushield_user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

export function setStoredUser(user: any) {
  localStorage.setItem('intrushield_user', JSON.stringify(user));
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status} error`);
  }

  return data as T;
}

export const authApi = {
  login: async (credentials: { email: string; password: string }) => {
    const res = await request<{ message: string; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    setStoredToken(res.token);
    setStoredUser(res.user);
    return res;
  },

  register: async (details: { email: string; password: string; name: string; role?: string }) => {
    const res = await request<{ message: string; token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(details),
    });
    setStoredToken(res.token);
    setStoredUser(res.user);
    return res;
  },

  getProfile: async () => {
    const res = await request<{ user: any }>('/auth/profile');
    setStoredUser(res.user);
    return res.user;
  },

  resetPassword: async (details: { email: string; newPassword: string }) => {
    return request<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(details),
    });
  },

  logout: () => {
    clearStoredToken();
  },
};
