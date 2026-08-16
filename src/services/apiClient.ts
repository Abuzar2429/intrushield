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

  const isFormData = options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
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

  googleLogin: async (credential: string) => {
    const res = await request<{ message: string; token: string; user: any }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
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

export const incidentsApi = {
  getIncidents: async (filters?: { status?: string; severity?: string }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.severity) params.append('severity', filters.severity);
    const queryString = params.toString() ? `?${params.toString()}` : '';

    return request<{ incidents: any[]; count: number }>(`/incidents${queryString}`);
  },

  getIncidentById: async (id: string) => {
    return request<{ incident: any }>(`/incidents/${id}`);
  },

  createIncident: async (incidentData: {
    title: string;
    severity: string;
    status?: string;
    sourceIp: string;
    targetIp: string;
    threatScore?: number;
    description?: string;
    mitigationStatus?: string;
  }) => {
    return request<{ message: string; incident: any }>('/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData),
    });
  },

  updateStatus: async (id: string, statusData: { status?: string; mitigationStatus?: string }) => {
    return request<{ message: string; incident: any }>(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  },
};

export const threatIntelApi = {
  getIocs: async (params?: { query?: string; type?: string; riskLevel?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.query) searchParams.append('query', params.query);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.riskLevel) searchParams.append('riskLevel', params.riskLevel);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';

    return request<{ iocs: any[]; count: number }>(`/threat-intel${queryString}`);
  },

  addIoc: async (iocData: {
    ioc: string;
    type: string;
    threatActor?: string;
    riskLevel: string;
    confidence?: number;
    description?: string;
  }) => {
    return request<{ message: string; ioc: any }>('/threat-intel', {
      method: 'POST',
      body: JSON.stringify(iocData),
    });
  },

  deleteIoc: async (id: string) => {
    return request<{ message: string; id: string }>(`/threat-intel/${id}`, {
      method: 'DELETE',
    });
  },
};

export const pcapApi = {
  getScans: async () => {
    return request<{ scans: any[]; count: number }>('/pcap/scans');
  },

  uploadPcap: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    return request<{ message: string; scan: any }>('/pcap/upload', {
      method: 'POST',
      body: formData,
    });
  },
};

export const mitigationApi = {
  blockIp: async (params: { ip: string; reason?: string; actionType?: string }) => {
    return request<{ message: string; rule: any }>('/mitigation/block-ip', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  getActiveRules: async () => {
    return request<{ rules: any[]; count: number }>('/mitigation/active-rules');
  },
};

export const usersApi = {
  getUsers: async () => {
    return request<{ users: any[]; count: number }>('/users');
  },

  updateRole: async (userId: string, role: string) => {
    return request<{ message: string; userId: string; newRole: string }>(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  },

  getAuditLogs: async () => {
    return request<{ logs: any[]; count: number }>('/users/audit-logs');
  },
};

