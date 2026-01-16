export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: 'admin' | 'super_admin';
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}
