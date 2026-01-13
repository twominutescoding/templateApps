import axios, { type AxiosInstance, AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios';

// API Base URL - adjust based on environment
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8091/auth/api/v1';

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
        const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        const { accessToken: newToken, refreshToken: newRefreshToken } = response.data.data;

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

// Auth types
export interface LoginRequest {
  username: string;
  password: string;
  applicationCode?: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  type: string;
  username: string;
  roles: string[];
  authenticationMethod: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  theme?: string;
  image?: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  type: string;
  username: string;
  roles: string[];
}

// Admin types
export interface UserAdmin {
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  status: string;
  theme: string;
  image?: string;
  createDate: string;
  createUser: string;
  roles: UserRole[];
}

export interface UserRole {
  role: string;
  entity: string;
  description: string;
  status: string;
}

export interface RoleAdmin {
  role: string;
  entity: string;
  roleLevel: string;
  description: string;
  createDate: string;
  createUser: string;
  userCount: number;
}

export interface SessionInfo {
  sessionId: number;
  username: string;
  entity: string;
  deviceName: string;
  ipAddress: string;
  location?: string;
  userAgent: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  current: boolean;
  revoked: boolean;
}

export interface DashboardStats {
  userStats: {
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
  };
  sessionStats: {
    totalActiveSessions: number;
    sessionsLast24Hours: number;
    totalRefreshTokens: number;
  };
  sessionsByEntity: Array<{
    entity: string;
    activeSessions: number;
    totalUsers: number;
  }>;
  recentActivity: Array<{
    username: string;
    action: string;
    ipAddress: string;
    timestamp: string;
  }>;
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
};

// Admin User API
export const adminUserAPI = {
  getAllUsers: async (): Promise<ApiResponse<UserAdmin[]>> => {
    const response = await apiClient.get<ApiResponse<UserAdmin[]>>('/admin/users');
    return response.data;
  },

  getUserByUsername: async (username: string): Promise<ApiResponse<UserAdmin>> => {
    const response = await apiClient.get<ApiResponse<UserAdmin>>(`/admin/users/${username}`);
    return response.data;
  },

  updateUser: async (username: string, userData: Partial<UserAdmin>): Promise<ApiResponse<UserAdmin>> => {
    const response = await apiClient.put<ApiResponse<UserAdmin>>(`/admin/users/${username}`, userData);
    return response.data;
  },

  updateUserStatus: async (username: string, status: string): Promise<ApiResponse<UserAdmin>> => {
    const response = await apiClient.put<ApiResponse<UserAdmin>>(`/admin/users/${username}/status`, { status });
    return response.data;
  },

  getUserRoles: async (username: string): Promise<ApiResponse<UserRole[]>> => {
    const response = await apiClient.get<ApiResponse<UserRole[]>>(`/admin/users/${username}/roles`);
    return response.data;
  },

  assignRole: async (username: string, role: string, entity: string): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>(`/admin/users/${username}/roles`, { role, entity });
    return response.data;
  },

  removeRole: async (username: string, role: string, entity: string): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/admin/users/${username}/roles/${role}/entity/${entity}`);
    return response.data;
  },
};

// Admin Role API
export const adminRoleAPI = {
  getAllRoles: async (entity?: string): Promise<ApiResponse<RoleAdmin[]>> => {
    const params = entity ? { entity } : {};
    const response = await apiClient.get<ApiResponse<RoleAdmin[]>>('/admin/roles', { params });
    return response.data;
  },

  getRole: async (role: string, entity: string): Promise<ApiResponse<RoleAdmin>> => {
    const response = await apiClient.get<ApiResponse<RoleAdmin>>(`/admin/roles/${role}/entity/${entity}`);
    return response.data;
  },

  createRole: async (roleData: { role: string; entity: string; roleLevel: string; description: string }): Promise<ApiResponse<RoleAdmin>> => {
    const response = await apiClient.post<ApiResponse<RoleAdmin>>('/admin/roles', roleData);
    return response.data;
  },

  updateRole: async (role: string, entity: string, roleData: { roleLevel: string; description: string }): Promise<ApiResponse<RoleAdmin>> => {
    const response = await apiClient.put<ApiResponse<RoleAdmin>>(`/admin/roles/${role}/entity/${entity}`, roleData);
    return response.data;
  },

  deleteRole: async (role: string, entity: string): Promise<ApiResponse<string>> => {
    const response = await apiClient.delete<ApiResponse<string>>(`/admin/roles/${role}/entity/${entity}`);
    return response.data;
  },
};

// Admin Session API
export const adminSessionAPI = {
  getAllSessions: async (): Promise<ApiResponse<SessionInfo[]>> => {
    const response = await apiClient.get<ApiResponse<SessionInfo[]>>('/auth/admin/sessions');
    return response.data;
  },

  revokeSession: async (sessionId: number): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>('/auth/admin/sessions/revoke', { sessionId });
    return response.data;
  },

  forceLogoutUser: async (username: string): Promise<ApiResponse<string>> => {
    const response = await apiClient.post<ApiResponse<string>>(`/auth/admin/users/${username}/logout`);
    return response.data;
  },
};

// Admin Dashboard API
export const adminDashboardAPI = {
  getDashboardStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/auth/admin/stats/dashboard');
    return response.data;
  },
};

export default apiClient;
