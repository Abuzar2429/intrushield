export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    createdAt: string;
  };
}

export interface HealthCheckResponse {
  status: 'online' | 'error';
  service: string;
  version: string;
  timestamp: string;
  database: {
    engine: string;
    status: string;
    usersCount: number;
    incidentsCount: number;
    threatIntelCount: number;
  };
}
