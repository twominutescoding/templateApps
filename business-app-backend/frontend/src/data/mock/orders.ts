import type { Order } from '../../types';

export const mockOrders: Order[] = [
  {
    id: 'ORD-001',
    userId: '2',
    products: [
      { productId: '1', productName: 'Laptop Pro 15', quantity: 1, price: 1299.99 },
      { productId: '3', productName: 'Mechanical Keyboard', quantity: 1, price: 89.99 },
    ],
    total: 1389.98,
    status: 'delivered',
    createdAt: '2024-11-15T10:30:00Z',
    updatedAt: '2024-11-18T14:20:00Z',
  },
  {
    id: 'ORD-002',
    userId: '3',
    products: [
      { productId: '4', productName: 'Monitor 27" 4K', quantity: 2, price: 399.99 },
    ],
    total: 799.98,
    status: 'shipped',
    createdAt: '2024-11-20T09:15:00Z',
    updatedAt: '2024-11-22T11:30:00Z',
  },
  {
    id: 'ORD-003',
    userId: '5',
    products: [
      { productId: '2', productName: 'Wireless Mouse', quantity: 3, price: 29.99 },
      { productId: '7', productName: 'Webcam HD', quantity: 1, price: 69.99 },
    ],
    total: 159.96,
    status: 'processing',
    createdAt: '2024-11-25T14:45:00Z',
    updatedAt: '2024-11-25T15:00:00Z',
  },
  {
    id: 'ORD-004',
    userId: '2',
    products: [
      { productId: '6', productName: 'Office Chair', quantity: 1, price: 249.99 },
    ],
    total: 249.99,
    status: 'pending',
    createdAt: '2024-12-01T11:20:00Z',
    updatedAt: '2024-12-01T11:20:00Z',
  },
  {
    id: 'ORD-005',
    userId: '4',
    products: [
      { productId: '1', productName: 'Laptop Pro 15', quantity: 2, price: 1299.99 },
      { productId: '4', productName: 'Monitor 27" 4K', quantity: 2, price: 399.99 },
    ],
    total: 3399.96,
    status: 'delivered',
    createdAt: '2024-10-10T08:00:00Z',
    updatedAt: '2024-10-15T16:30:00Z',
  },
];
