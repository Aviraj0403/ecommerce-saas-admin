import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { displayAPIError, handleAPIError, handleServerError } from './errorHandler';
import { handleAuthError } from '../auth/errorHandler';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:6005';
const TENANT_ID = process.env.NEXT_PUBLIC_PROJECT_ID || '';

class APIClient {
  private client: AxiosInstance;

  constructor(baseURL: string) {
    this.client = axios.create({
      baseURL: `${baseURL}/v1/api`,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for auth token and tenant ID
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Add tenant identifier
        const tenantId = this.getTenantId();
        if (tenantId) {
          config.headers['X-Project-ID'] = tenantId;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        const apiError = handleAPIError(error);
        
        // Handle authentication errors
        if (apiError.statusCode === 401) {
          handleAuthError(error);
          return Promise.reject(error);
        }
        
        // Handle network errors
        if (apiError.code === 'NETWORK_ERROR') {
          console.error('Network error detected:', error);
        }
        
        // Handle server errors
        if (apiError.statusCode && apiError.statusCode >= 500) {
          handleServerError(error);
        }
        
        return Promise.reject(error);
      }
    );
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }

  private getTenantId(): string {
    if (typeof window === 'undefined') return TENANT_ID;
    return localStorage.getItem('tenant_id') || TENANT_ID;
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  // Method to make requests with automatic error display
  async request<T>(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    url: string,
    data?: any,
    config?: AxiosRequestConfig & { showError?: boolean }
  ): Promise<T> {
    try {
      const { showError = true, ...axiosConfig } = config || {};
      
      let response;
      switch (method) {
        case 'get':
          response = await this.get<T>(url, axiosConfig);
          break;
        case 'post':
          response = await this.post<T>(url, data, axiosConfig);
          break;
        case 'put':
          response = await this.put<T>(url, data, axiosConfig);
          break;
        case 'patch':
          response = await this.patch<T>(url, data, axiosConfig);
          break;
        case 'delete':
          response = await this.delete<T>(url, axiosConfig);
          break;
        default:
          throw new Error(`Unsupported method: ${method}`);
      }
      
      return response;
    } catch (error) {
      if (config?.showError !== false) {
        displayAPIError(error);
      }
      throw error;
    }
  }

  // Get the underlying axios instance for advanced usage
  getClient(): AxiosInstance {
    return this.client;
  }
}

export const apiClient = new APIClient(API_URL);
export default apiClient;
