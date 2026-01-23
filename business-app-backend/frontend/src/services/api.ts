import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

// API Base URL - adjust based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8090/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and automatic token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Handle both 401 (Unauthorized) and 403 (Forbidden) for expired tokens
    if ((error.response?.status === 401 || error.response?.status === 403) && !originalRequest._retry) {
      if (isRefreshing) {
        // If token is already being refreshed, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        // No refresh token - logout
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const response = await axios.post<ApiResponse<LoginResponse>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { token: newToken, refreshToken: newRefreshToken } = response.data.data;

        // Update tokens in localStorage
        localStorage.setItem('token', newToken);
        localStorage.setItem('refreshToken', newRefreshToken);

        // Update the authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }

        // Process queued requests
        processQueue(null, newToken);

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed - logout
        processQueue(refreshError as AxiosError, null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  type: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken: string;
  type?: string;
  username?: string;
  roles?: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  active: boolean;
}

// Product types
export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  quantity: number;
  category: string;
  sku: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'OUT_OF_STOCK' | 'DISCONTINUED';
}

export interface SearchRequest {
  filters: Record<string, string>;
  dateRanges?: Record<string, { from?: string; to?: string }>;
  sort?: {
    column: string;
    order: 'asc' | 'desc';
  };
  page: number;
  pageSize: number;
}

// Auth API
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', credentials);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> => {
    const response = await apiClient.post<ApiResponse<RefreshTokenResponse>>('/auth/refresh', { refreshToken });
    return response.data;
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },
};

// User API
export const userAPI = {
  getProfile: async (): Promise<ApiResponse<User>> => {
    const response = await apiClient.get<ApiResponse<User>>('/users/profile');
    return response.data;
  },

  updateProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await apiClient.put<ApiResponse<User>>('/users/profile', userData);
    return response.data;
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
};

// Product API
export const productAPI = {
  search: async (searchRequest: SearchRequest): Promise<ApiResponse<PageResponse<Product>>> => {
    const response = await apiClient.post<ApiResponse<PageResponse<Product>>>('/products/search', searchRequest);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`);
    return response.data;
  },

  create: async (product: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await apiClient.post<ApiResponse<Product>>('/products', product);
    return response.data;
  },

  update: async (id: number, product: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, product);
    return response.data;
  },

  bulkUpdate: async (products: Product[]): Promise<ApiResponse<Product[]>> => {
    const response = await apiClient.put<ApiResponse<Product[]>>('/products/bulk-update', { products });
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/products/${id}`);
    return response.data;
  },
};

// Demo Product API - for examples and testing
export const demoProductAPI = {
  search: async (searchRequest: SearchRequest): Promise<ApiResponse<PageResponse<Product>>> => {
    const response = await apiClient.post<ApiResponse<PageResponse<Product>>>('/demo/products/search', searchRequest);
    return response.data;
  },

  getById: async (id: number): Promise<ApiResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/demo/products/${id}`);
    return response.data;
  },

  create: async (product: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await apiClient.post<ApiResponse<Product>>('/demo/products', product);
    return response.data;
  },

  update: async (id: number, product: Partial<Product>): Promise<ApiResponse<Product>> => {
    const response = await apiClient.put<ApiResponse<Product>>(`/demo/products/${id}`, product);
    return response.data;
  },

  bulkUpdate: async (products: Product[]): Promise<ApiResponse<Product[]>> => {
    const response = await apiClient.put<ApiResponse<Product[]>>('/demo/products/bulk-update', { products });
    return response.data;
  },

  delete: async (id: number): Promise<ApiResponse<void>> => {
    const response = await apiClient.delete<ApiResponse<void>>(`/demo/products/${id}`);
    return response.data;
  },
};

export default apiClient;
