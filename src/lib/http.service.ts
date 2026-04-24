import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

import { useAuthStore } from '@/stores/useAuthStore';

import { API_BASE_URL } from './api.config';

export interface HttpResult<T> {
  isSuccess: boolean;
  status: number;
  data: T;
  error?: string;
  errorCode?: 'ApiError' | 'NoResponse' | 'RequestError';
}

class HttpService {
  private client: AxiosInstance;

  constructor(headers?: Record<string, string>) {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    // Public endpoints that must NOT send an Authorization header
    const PUBLIC_ENDPOINTS = ['/agents/login', '/agents/register'];

    this.client.interceptors.request.use((config) => {
      const isPublic = PUBLIC_ENDPOINTS.some((ep) => config.url?.includes(ep));
      if (isPublic) {
        delete config.headers['Authorization'];
      } else if (!config.headers['Authorization']) {
        const token = useAuthStore.getState().token;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
          }
          if (status === 403) {
            const data = error.response.data;
            if (data?.message === 'SESSION_EXPIRED_ERROR') {
              if (typeof window !== 'undefined') {
                window.location.href = '/login?expired=true';
              }
            }
          }
        }
        return Promise.reject(error);
      },
    );
  }

  setToken(token: string) {
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearToken() {
    delete this.client.defaults.headers.common['Authorization'];
  }

  async get<T>(url: string, config?: AxiosRequestConfig): Promise<HttpResult<T>> {
    try {
      const response = await this.client.get<T>(url, config);
      return {
        isSuccess: true,
        status: response.status,
        data: response.data,
      };
    } catch (error: unknown) {
      return this.handleError<T>(error);
    }
  }

  async post<TData, TResponse>(
    url: string,
    data?: TData,
    config?: AxiosRequestConfig,
  ): Promise<HttpResult<TResponse>> {
    try {
      const response = await this.client.post<TResponse>(url, data, config);
      return {
        isSuccess: true,
        status: response.status,
        data: response.data,
      };
    } catch (error: unknown) {
      return this.handleError<TResponse>(error);
    }
  }

  async put<TData, TResponse>(
    url: string,
    data?: TData,
    config?: AxiosRequestConfig,
  ): Promise<HttpResult<TResponse>> {
    try {
      const response = await this.client.put<TResponse>(url, data, config);
      return {
        isSuccess: true,
        status: response.status,
        data: response.data,
      };
    } catch (error: unknown) {
      return this.handleError<TResponse>(error);
    }
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<HttpResult<T>> {
    try {
      const response = await this.client.delete<T>(url, config);
      return {
        isSuccess: true,
        status: response.status,
        data: response.data,
      };
    } catch (error: unknown) {
      return this.handleError<T>(error);
    }
  }

  private handleError<T>(error: unknown): HttpResult<T> {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        return {
          isSuccess: false,
          status: error.response.status,
          data: error.response.data,
          error: error.response.data?.message || error.message,
          errorCode: 'ApiError',
        };
      }
      if (error.request) {
        return {
          isSuccess: false,
          status: 0,
          data: null as unknown as T,
          error: 'No response received',
          errorCode: 'NoResponse',
        };
      }
    }
    return {
      isSuccess: false,
      status: 0,
      data: null as unknown as T,
      error: error instanceof Error ? error.message : 'Unknown error',
      errorCode: 'RequestError',
    };
  }
}

export const httpService = new HttpService();
export const httpServiceFiles = new HttpService();

export default HttpService;
