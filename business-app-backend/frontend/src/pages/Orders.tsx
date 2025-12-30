import { Box, Typography, Chip } from '@mui/material';
import DataTable from '../components/common/DataTable';
import { mockOrders } from '../data/mock';
import type { TableColumn, Order } from '../types';

const columns: TableColumn<Order>[] = [
  { id: 'id', label: 'Order ID', minWidth: 100 },
  {
    id: 'products',
    label: 'Items',
    minWidth: 80,
    align: 'center',
    format: (value: any[]) => value.length.toString(),
  },
  {
    id: 'total',
    label: 'Total',
    minWidth: 120,
    align: 'right',
    format: (value: number) => `$${value.toFixed(2)}`,
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 120,
    format: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
  },
  {
    id: 'createdAt',
    label: 'Order Date',
    minWidth: 150,
    format: (value: string) => new Date(value).toLocaleDateString(),
  },
];

const Orders = () => {
  const totalRevenue = mockOrders.reduce((sum, order) => sum + order.total, 0);

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Orders
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label={`$${totalRevenue.toFixed(2)} Revenue`} color="success" />
          <Chip label={`${mockOrders.length} Orders`} color="primary" />
        </Box>
      </Box>

      <DataTable columns={columns} data={mockOrders} rowsPerPageOptions={[5, 10, 25]} />
    </Box>
  );
};

export default Orders;
