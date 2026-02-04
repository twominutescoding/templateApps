// Re-export User from auth types (canonical source)
export type { User, UserRole, AuthTokens, LoginCredentials, AuthState, DecodedToken } from './auth';

// Product types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  status: 'active' | 'inactive' | 'discontinued';
  imageUrl?: string;
}

// Order types
export interface Order {
  id: string;
  userId: string;
  products: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// Analytics types
export interface Analytics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
}

// Table types
export interface TableColumn<T> {
  id: keyof T;
  label: string;
  minWidth?: number;
  align?: 'left' | 'right' | 'center';
  format?: (value: any) => string;
}

// Common types
export interface NavItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  children?: NavItem[];
}
