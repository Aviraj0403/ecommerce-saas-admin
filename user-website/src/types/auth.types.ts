import { User } from './user.types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface OTPRequest {
  phone: string;
}

export interface OTPVerification {
  phone: string;
  otp: string;
}

export interface FirebaseAuthData {
  idToken: string;
  provider: 'google' | 'facebook';
}
