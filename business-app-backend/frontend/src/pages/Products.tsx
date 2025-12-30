import { Box, Typography, Chip } from '@mui/material';
import DataTable from '../components/common/DataTable';
import { mockProducts } from '../data/mock';
import type { TableColumn, Product } from '../types';

const columns: TableColumn<Product>[] = [
  { id: 'name', label: 'Product Name', minWidth: 170 },
  { id: 'category', label: 'Category', minWidth: 130 },
  {
    id: 'price',
    label: 'Price',
    minWidth: 100,
    align: 'right',
    format: (value: number) => `$${value.toFixed(2)}`,
  },
  {
    id: 'stock',
    label: 'Stock',
    minWidth: 80,
    align: 'center',
    format: (value: number) => value.toString(),
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: 100,
    format: (value: string) => value.charAt(0).toUpperCase() + value.slice(1),
  },
];

const Products = () => {
  const activeProducts = mockProducts.filter((p) => p.status === 'active').length;

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Products
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Chip label={`${activeProducts} Active`} color="success" />
          <Chip label={`${mockProducts.length} Total`} color="primary" />
        </Box>
      </Box>

      <DataTable columns={columns} data={mockProducts} rowsPerPageOptions={[5, 10, 25]} />
    </Box>
  );
};

export default Products;
