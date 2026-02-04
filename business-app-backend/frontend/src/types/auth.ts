export type UserRole = 'admin' | 'manager' | 'user';
export type AuthenticationMethod = 'DATABASE' | 'LDAP' | string;

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  department?: string;
  phone?: string;
  createdAt: string;
  authenticationMethod?: AuthenticationMethod;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface DecodedToken {
  userId?: string;
  sub?: string;
  email?: string;
  role?: UserRole;
  exp: number;
  iat: number;
}
