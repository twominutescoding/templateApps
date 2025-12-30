import { useState } from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import DataExport from '../../components/advanced/DataExport';
import StatusChip from '../../components/common/StatusChip';
import type { StatusType } from '../../components/common/StatusChip';

const ComprehensiveTableDemo = () => {
  const [data, setData] = useState([
    { id: 1, orderNumber: 'ORD-001', customer: 'Acme Corp', product: 'Laptop Pro', category: 'Electronics', price: 1299, quantity: 5, total: 6495, status: 'success', statusLabel: 'Delivered', orderDate: '2024-01-15', deliveryDate: '2024-01-20' },
    { id: 2, orderNumber: 'ORD-002', customer: 'TechStart Inc', product: 'Wireless Mouse', category: 'Accessories', price: 29, quantity: 150, total: 4350, status: 'success', statusLabel: 'Delivered', orderDate: '2024-01-18', deliveryDate: '2024-01-22' },
    { id: 3, orderNumber: 'ORD-003', customer: 'Global Systems', product: 'USB-C Hub', category: 'Accessories', price: 49, quantity: 89, total: 4361, status: 'info', statusLabel: 'In Transit', orderDate: '2024-01-20', deliveryDate: '2024-01-25' },
    { id: 4, orderNumber: 'ORD-004', customer: 'MegaStore Ltd', product: 'Monitor 27"', category: 'Electronics', price: 399, quantity: 23, total: 9177, status: 'warning', statusLabel: 'Delayed', orderDate: '2024-01-22', deliveryDate: '2024-01-28' },
    { id: 5, orderNumber: 'ORD-005', customer: 'QuickShop', product: 'Keyboard RGB', category: 'Accessories', price: 79, quantity: 67, total: 5293, status: 'pending', statusLabel: 'Processing', orderDate: '2024-02-01', deliveryDate: '2024-02-05' },
    { id: 6, orderNumber: 'ORD-006', customer: 'DataCom', product: 'Webcam HD', category: 'Electronics', price: 89, quantity: 34, total: 3026, status: 'success', statusLabel: 'Delivered', orderDate: '2024-02-05', deliveryDate: '2024-02-10' },
    { id: 7, orderNumber: 'ORD-007', customer: 'SoundWave Co', product: 'Headset Pro', category: 'Audio', price: 159, quantity: 56, total: 8904, status: 'info', statusLabel: 'Shipped', orderDate: '2024-02-08', deliveryDate: '2024-02-12' },
    { id: 8, orderNumber: 'ORD-008', customer: 'Office Plus', product: 'Desk Lamp', category: 'Office', price: 39, quantity: 120, total: 4680, status: 'success', statusLabel: 'Delivered', orderDate: '2024-02-10', deliveryDate: '2024-02-15' },
    { id: 9, orderNumber: 'ORD-009', customer: 'WorkSpace Inc', product: 'Standing Desk', category: 'Furniture', price: 599, quantity: 12, total: 7188, status: 'warning', statusLabel: 'Delayed', orderDate: '2024-02-12', deliveryDate: '2024-02-18' },
    { id: 10, orderNumber: 'ORD-010', customer: 'ComfortSeats', product: 'Office Chair', category: 'Furniture', price: 249, quantity: 28, total: 6972, status: 'pending', statusLabel: 'Processing', orderDate: '2024-02-15', deliveryDate: '2024-02-20' },
    { id: 11, orderNumber: 'ORD-011', customer: 'MobileTech', product: 'Phone Stand', category: 'Accessories', price: 19, quantity: 0, total: 0, status: 'error', statusLabel: 'Failed', orderDate: '2024-02-18', deliveryDate: '2024-02-25' },
    { id: 12, orderNumber: 'ORD-012', customer: 'CableWorld', product: 'USB Cable', category: 'Accessories', price: 12, quantity: 200, total: 2400, status: 'cancelled', statusLabel: 'Cancelled', orderDate: '2024-02-20', deliveryDate: '2024-02-24' },
    { id: 13, orderNumber: 'ORD-013', customer: 'Display Pro', product: 'HDMI Cable', category: 'Accessories', price: 15, quantity: 180, total: 2700, status: 'success', statusLabel: 'Delivered', orderDate: '2024-02-22', deliveryDate: '2024-02-26' },
    { id: 14, orderNumber: 'ORD-014', customer: 'Audio Masters', product: 'Studio Speakers', category: 'Audio', price: 449, quantity: 8, total: 3592, status: 'info', statusLabel: 'Shipped', orderDate: '2024-02-25', deliveryDate: '2024-03-01' },
    { id: 15, orderNumber: 'ORD-015', customer: 'PrintHub', product: 'Printer A4', category: 'Office', price: 199, quantity: 15, total: 2985, status: 'pending', statusLabel: 'Processing', orderDate: '2024-02-28', deliveryDate: '2024-03-05' },
  ]);

  const [selectedRows, setSelectedRows] = useState<number[]>([]);

  const columns = [
    { id: 'id', label: 'ID', filterType: 'number' as const, editable: false },
    { id: 'orderNumber', label: 'Order #', filterType: 'text' as const, editable: false },
    { id: 'customer', label: 'Customer', filterType: 'text' as const, editable: true, editType: 'text' as const },
    { id: 'product', label: 'Product', filterType: 'text' as const, editable: true, editType: 'text' as const },
    {
      id: 'category',
      label: 'Category',
      filterType: 'select' as const,
      editable: true,
      editType: 'select' as const,
      filterOptions: [
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Accessories', value: 'Accessories' },
        { label: 'Audio', value: 'Audio' },
        { label: 'Office', value: 'Office' },
        { label: 'Furniture', value: 'Furniture' },
      ]
    },
    { id: 'price', label: 'Price ($)', filterType: 'number' as const, editable: true, editType: 'number' as const },
    { id: 'quantity', label: 'Qty', filterType: 'number' as const, editable: true, editType: 'number' as const },
    { id: 'total', label: 'Total ($)', filterType: 'number' as const, editable: false },
    {
      id: 'status',
      label: 'Status',
      filterType: 'select' as const,
      editable: false,
      filterOptions: [
        { label: 'Delivered', value: 'success' },
        { label: 'Failed', value: 'error' },
        { label: 'Delayed', value: 'warning' },
        { label: 'Shipped', value: 'info' },
        { label: 'Processing', value: 'pending' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      render: (row: Record<string, any>) => (
        <StatusChip status={row.status as StatusType} label={row.statusLabel} />
      ),
    },
    { id: 'orderDate', label: 'Order Date', filterType: 'date' as const, editable: true, editType: 'date' as const },
    { id: 'deliveryDate', label: 'Delivery Date', filterType: 'date' as const, editable: false },
  ];

  const handleBulkSave = async (rows: Record<string, any>[]) => {
    console.log('Bulk saving rows:', rows);

    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Update local state with all changed rows
        setData((prev) =>
          prev.map((item) => {
            const updatedRow = rows.find((r) => r.id === item.id);
            if (updatedRow) {
              // Recalculate total if price or quantity changed
              const newPrice = updatedRow.price;
              const newQuantity = updatedRow.quantity;
              const newTotal = newPrice * newQuantity;
              return { ...item, ...updatedRow, total: newTotal };
            }
            return item;
          })
        );
        console.log('All rows saved successfully');
        resolve();
      }, 1000);
    });
  };

  const handleExportSelected = () => {
    const selectedData = data.filter((row) => selectedRows.includes(row.id));
    return selectedData;
  };

  const handleToggleRow = (id: number) => {
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedRows.length === data.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(data.map((row) => row.id));
    }
  };

  const handleClearSelection = () => {
    setSelectedRows([]);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
        Comprehensive Table Demo
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        All features in one table: Bulk Edit, Filtering, Sorting, Date Range, Pagination, and Status Indicators
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Feature Highlights */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            ✨ Features Demonstrated
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 2 }}>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                📝 Bulk Edit Mode
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Click "Edit All" to edit multiple rows, then "Save All" to commit changes
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                🔍 Advanced Filtering
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Text, number, select dropdowns, and date range filters per column
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                📊 Status Indicators
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Animated status chips: Delivered, Failed, Delayed, Shipped, Processing, Cancelled
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                📄 Pagination
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Multiple page sizes (5, 10, 25, 50, 100) with page navigation
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                ↕️ Sorting
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Click column headers to sort ascending/descending
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>
                📅 Date Range Filtering
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Select date ranges with From/To pickers for Order Date and Delivery Date
              </Typography>
            </Box>
          </Box>
        </Paper>

        {/* Selection and Export Section */}
        <Paper sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Selection & Export ({selectedRows.length} selected)
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={handleSelectAll}
              >
                {selectedRows.length === data.length ? 'Deselect All' : 'Select All'}
              </Button>
              {selectedRows.length > 0 && (
                <Button
                  size="small"
                  variant="outlined"
                  color="secondary"
                  onClick={handleClearSelection}
                >
                  Clear Selection
                </Button>
              )}
            </Box>
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {data.map((row) => (
              <Button
                key={row.id}
                size="small"
                variant={selectedRows.includes(row.id) ? 'contained' : 'outlined'}
                onClick={() => handleToggleRow(row.id)}
                sx={{ minWidth: 100 }}
              >
                {row.orderNumber}
              </Button>
            ))}
          </Box>
          {selectedRows.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <DataExport
                title="Export Selected Orders"
                data={handleExportSelected()}
              />
            </Box>
          )}
        </Paper>

        {/* Main Comprehensive Table */}
        <AdvancedDataTable
          title="📦 Order Management System"
          columns={columns}
          data={data}
          onBulkSave={handleBulkSave}
          enableBulkEdit={true}
          rowIdField="id"
          defaultSortColumn="orderDate"
          defaultSortOrder="desc"
        />

        {/* Instructions */}
        <Paper sx={{ p: 3, bgcolor: 'info.light', color: 'info.contrastText' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
            💡 How to Use
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <li>
              <Typography variant="body2">
                <strong>Bulk Edit:</strong> Click "Edit All" button above the table to enable editing for all rows on current page
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Filtering:</strong> Use filter inputs below column headers to search/filter data
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Date Filters:</strong> Select date ranges using "From" and "To" pickers for date columns
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Sorting:</strong> Click any column header to sort (click again to reverse order)
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Selection:</strong> Select individual orders using buttons above, then export selected data
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Pagination:</strong> Use pagination controls at bottom to navigate through pages
              </Typography>
            </li>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
};

export default ComprehensiveTableDemo;
