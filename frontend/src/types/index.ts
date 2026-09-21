export type RoleType = 'ROLE_CUSTOMER' | 'ROLE_ADMIN' | 'ROLE_STAFF';

export interface User {
  id: number;
  email: string;
  fullName: string;
  phoneNumber?: string;
  avatarUrl?: string;
  active: boolean;
  authProvider: string;
  roles: RoleType[];
  createdAt: string;
}

export interface AuthResponse {
  tokenType: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
}

export interface ApiResponse<T> {
  status: string;
  data: T;
  message?: string;
}

export interface HealthCheckResponse {
  status: string;
  service: string;
  timestamp: string;
}
