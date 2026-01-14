import { useState, useMemo, useCallback } from 'react';
import { Box, Typography, Paper, Alert, IconButton, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import StatusChip from '../../components/common/StatusChip';
import type { StatusType } from '../../components/common/StatusChip';
import { demoProductAPI, type SearchRequest, type Product } from '../../services/api';
import { useDateFormat } from '../../context/DateFormatContext';

// Map product status to StatusChip status (outside component to prevent recreating)
const getStatusInfo = (status: string): { status: StatusType; label: string } => {
    switch (status) {
      case 'ACTIVE':
        return { status: 'success', label: 'Active' };
      case 'INACTIVE':
        return { status: 'error', label: 'Inactive' };
      case 'DRAFT':
        return { status: 'pending', label: 'Draft' };
      case 'OUT_OF_STOCK':
        return { status: 'warning', label: 'Out of Stock' };
      case 'DISCONTINUED':
        return { status: 'cancelled', label: 'Discontinued' };
      default:
        return { status: 'info', label: status };
    }
};

const DemoProductsPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { formatTimestamp } = useDateFormat();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  const columns = useMemo(() => [
    { id: 'id', label: 'ID', filterType: 'number' as const, editable: false, width: 80 },
    { id: 'sku', label: 'SKU', filterType: 'text' as const, editable: true, editType: 'text' as const, width: 100 },
    { id: 'name', label: 'Product Name', filterType: 'text' as const, editable: true, editType: 'text' as const, minWidth: 150 },
    { id: 'description', label: 'Description', filterType: 'text' as const, editable: true, editType: 'text' as const, minWidth: 200 },
    {
      id: 'category',
      label: 'Category',
      filterType: 'select' as const,
      editable: true,
      editType: 'select' as const,
      width: 120,
      filterOptions: [
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Accessories', value: 'Accessories' },
        { label: 'Audio', value: 'Audio' },
        { label: 'Office', value: 'Office' },
        { label: 'Furniture', value: 'Furniture' },
        { label: 'Storage', value: 'Storage' },
      ]
    },
    { id: 'price', label: 'Price ($)', filterType: 'number' as const, editable: true, editType: 'number' as const, width: 100 },
    { id: 'quantity', label: 'Stock', filterType: 'number' as const, editable: true, editType: 'number' as const, width: 80 },
    {
      id: 'status',
      label: 'Status',
      filterType: 'select' as const,
      editable: false,
      width: 150,
      filterOptions: [
        { label: 'Active', value: 'ACTIVE' },
        { label: 'Inactive', value: 'INACTIVE' },
        { label: 'Draft', value: 'DRAFT' },
        { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
        { label: 'Discontinued', value: 'DISCONTINUED' },
      ],
      render: (row: Record<string, any>) => {
        const { status, label } = getStatusInfo(row.status);
        return <StatusChip status={status} label={label} />;
      },
    },
    {
      id: 'createdAt',
      label: 'Created At',
      filterType: 'date' as const,
      editable: false,
      width: 180,
      render: (row: Record<string, any>) => {
        return row.createdAt ? formatTimestamp(row.createdAt) : '';
      },
    },
    {
      id: 'updatedAt',
      label: 'Updated At',
      filterType: 'date' as const,
      editable: false,
      width: 180,
      render: (row: Record<string, any>) => {
        return row.updatedAt ? formatTimestamp(row.updatedAt) : '';
      },
    },
  ], [formatTimestamp]);

  // Fetch data from backend
  const fetchData = useCallback(async (params: any) => {
    setLoading(true);
    setError('');

    // Convert FetchParams to SearchRequest format
    const searchRequest: SearchRequest = {
      filters: params.filters || {},
      dateRanges: params.dateRanges ?
        Object.fromEntries(
          Object.entries(params.dateRanges).map(([key, value]: [string, any]) => [
            key,
            { from: value.from || undefined, to: value.to || undefined }
          ])
        ) : {},
      sort: params.sort,
      page: params.page || 0,
      pageSize: params.pageSize || 10,
    };

    try {
      const response = await demoProductAPI.search(searchRequest);

      if (response.success && response.data) {
        setData(response.data.content);
        setTotalRecords(response.data.totalElements);
      } else {
        setError(response.message || 'Failed to fetch products');
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch products from backend');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle bulk save
  const handleBulkSave = useCallback(async (rows: Record<string, any>[]) => {
    try {
      const productsToUpdate = rows.map(row => ({
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        quantity: row.quantity,
        category: row.category,
        sku: row.sku,
        status: row.status,
      }));

      const response = await demoProductAPI.bulkUpdate(productsToUpdate as Product[]);

      if (response.success) {
        // Update local state with saved data
        setData((prev) =>
          prev.map((item) => {
            const updated = response.data?.find((p) => p.id === item.id);
            return updated || item;
          })
        );
      } else {
        throw new Error(response.message || 'Bulk update failed');
      }
    } catch (err: any) {
      console.error('Error bulk updating products:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to save products');
    }
  }, []);

  // Handle single row save
  const handleSave = useCallback(async (row: Record<string, any>) => {
    try {
      const productToUpdate = {
        id: row.id,
        name: row.name,
        description: row.description,
        price: row.price,
        quantity: row.quantity,
        category: row.category,
        sku: row.sku,
        status: row.status,
      };

      const response = await demoProductAPI.update(row.id, productToUpdate);

      if (response.success) {
        // Update local state
        setData((prev) =>
          prev.map((item) => (item.id === row.id ? response.data : item))
        );
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (err: any) {
      console.error('Error updating product:', err);
      throw new Error(err.response?.data?.message || err.message || 'Failed to save product');
    }
  }, []);

  // Handle delete product
  const handleDelete = useCallback(async (id: number, name: string) => {
    if (confirm(`Are you sure you want to delete product "${name}"? This action cannot be undone.`)) {
      try {
        const response = await demoProductAPI.delete(id);
        if (response.success) {
          // Remove from local state
          setData((prev) => prev.filter((item) => item.id !== id));
          setTotalRecords((prev) => prev - 1);
          setError(''); // Clear any previous errors
        } else {
          setError(response.message || 'Failed to delete product');
        }
      } catch (err: any) {
        console.error('Error deleting product:', err);
        setError(err.response?.data?.message || err.message || 'Failed to delete product');
      }
    }
  }, []);

  // Handle row click - demonstrate master-detail pattern
  const handleRowClick = useCallback((rowId: string | number, rowData: Record<string, any>) => {
    console.log('Row clicked!');
    console.log('Product ID:', rowId);
    console.log('Product Data:', rowData);
    setSelectedProductId(rowId as number);
    // You can now:
    // - Navigate to detail page: navigate(`/products/${rowId}`)
    // - Open a modal/drawer with details
    // - Expand row to show more info
    // - Load related data (order items, history, etc.)
    alert(`Clicked on product: ${rowData.name} (ID: ${rowId})\n\nCheck console for full data!`);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        Demo Products Table
      </Typography>

      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        This table is connected to the Spring Boot backend using <strong>/api/demo/products</strong> endpoints.
        It demonstrates all advanced features including server-side filtering, sorting, pagination, inline editing, bulk updates, and delete actions.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>
        <AdvancedDataTable
          title="Demo Products"
          columns={columns}
          data={data}
          totalRecords={totalRecords}
          loading={loading}
          enableBulkEdit
          onBulkSave={handleBulkSave}
          onSave={handleSave}
          rowIdField="id"
          onFetchData={fetchData}
          filterTrigger="manual"
          onRowClick={handleRowClick}
          renderActions={(row: Record<string, any>) => (
            <Tooltip title="Delete Product">
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(row.id, row.name)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        />
      </Paper>

      {selectedProductId && (
        <Paper sx={{ p: 3, mb: 3, backgroundColor: 'info.light' }}>
          <Typography variant="h6" gutterBottom>
            Selected Product ID: {selectedProductId}
          </Typography>
          <Typography variant="body2">
            This demonstrates the master-detail pattern. You can replace this with:
          </Typography>
          <ul>
            <li>A detailed form or view of the selected product</li>
            <li>Related data (order history, reviews, inventory movements)</li>
            <li>Charts and analytics for this product</li>
            <li>Navigation to a dedicated detail page</li>
          </ul>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Features Demonstrated
        </Typography>
        <ul>
          <li><strong>Server-side data fetching</strong> - Data loaded from Spring Boot backend</li>
          <li><strong>Server-side filtering</strong> - Filters applied on the backend using JPA Specifications</li>
          <li><strong>Server-side sorting</strong> - Sorting handled by the database</li>
          <li><strong>Server-side pagination</strong> - Only requested page is fetched</li>
          <li><strong>Inline editing</strong> - Edit individual rows with Save/Cancel</li>
          <li><strong>Bulk editing</strong> - Edit multiple rows and save all at once</li>
          <li><strong>Row selection</strong> - Select rows for bulk operations</li>
          <li><strong>Data export</strong> - Export filtered data to CSV/Excel</li>
          <li><strong>Status chips</strong> - Visual status indicators for product states</li>
          <li><strong>Date filtering</strong> - Filter by date ranges (if applicable)</li>
        </ul>
      </Paper>
    </Box>
  );
};

export default DemoProductsPage;
