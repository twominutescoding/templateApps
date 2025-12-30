import { Box, Typography, Chip } from '@mui/material';
import DataTable from '../components/common/DataTable';
import { mockUsers } from '../data/mock';
import type { TableColumn, User } from '../types';

const columns: TableColumn<User>[] = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'email', label: 'Email', minWidth: 200 },
  {
    id: 'role',
    label: 'Role',
    minWidth: 100,
    format: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
  },
  { id: 'department', label: 'Department', minWidth: 130 },
  {
    id: 'createdAt',
    label: 'Created At',
    minWidth: 150,
    format: (value: string) => new Date(value).toLocaleDateString(),
  },
];

const Customers = () => {
  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Customers
        </Typography>
        <Chip label={`${mockUsers.length} Total`} color="primary" />
      </Box>

      <DataTable columns={columns} data={mockUsers} rowsPerPageOptions={[5, 10, 25]} />
    </Box>
  );
};

export default Customers;
