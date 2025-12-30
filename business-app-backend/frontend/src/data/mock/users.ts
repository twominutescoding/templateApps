import type { User } from '../../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'admin',
    department: 'IT',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    role: 'manager',
    department: 'Sales',
    createdAt: '2024-02-20T14:45:00Z',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob.johnson@example.com',
    role: 'user',
    department: 'Marketing',
    createdAt: '2024-03-10T09:15:00Z',
  },
  {
    id: '4',
    name: 'Alice Williams',
    email: 'alice.williams@example.com',
    role: 'manager',
    department: 'HR',
    createdAt: '2024-04-05T11:20:00Z',
  },
  {
    id: '5',
    name: 'Charlie Brown',
    email: 'charlie.brown@example.com',
    role: 'user',
    department: 'Operations',
    createdAt: '2024-05-12T16:30:00Z',
  },
];
