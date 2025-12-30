import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import DataExport from '../../components/advanced/DataExport';
import BulkActions from '../../components/advanced/BulkActions';
import FileUpload from '../../components/advanced/FileUpload';
import AdvancedDataTable from '../../components/table/AdvancedDataTable';
import StatusChip from '../../components/common/StatusChip';
import type { StatusType } from '../../components/common/StatusChip';

const AdvancedFeatures = () => {
  const [editableData, setEditableData] = React.useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin', status: 'success' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user', status: 'success' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'user', status: 'pending' },
  ]);

  const [bulkEditData, setBulkEditData] = React.useState([
    { id: 1, product: 'Laptop Pro', price: 1299, quantity: 5, category: 'Electronics' },
    { id: 2, product: 'Wireless Mouse', price: 29, quantity: 150, category: 'Accessories' },
    { id: 3, product: 'USB-C Hub', price: 49, quantity: 89, category: 'Accessories' },
    { id: 4, product: 'Monitor 27"', price: 399, quantity: 23, category: 'Electronics' },
  ]);

  const exportData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', status: 'Active' },
  ];

  const bulkData = [
    { id: 1, name: 'Project Alpha', category: 'Development', status: 'In Progress' },
    { id: 2, name: 'Project Beta', category: 'Design', status: 'Completed' },
    { id: 3, name: 'Project Gamma', category: 'Marketing', status: 'Planning' },
    { id: 4, name: 'Project Delta', category: 'Development', status: 'In Progress' },
    { id: 5, name: 'Project Epsilon', category: 'Research', status: 'On Hold' },
  ];

  const tableData = [
    { id: 1, product: 'Laptop Pro', category: 'Electronics', price: 1299, stock: 45, status: 'success', statusLabel: 'Delivered', orderDate: '2024-01-15', deliveryDate: '2024-01-20' },
    { id: 2, product: 'Wireless Mouse', category: 'Accessories', price: 29, stock: 150, status: 'success', statusLabel: 'Delivered', orderDate: '2024-01-18', deliveryDate: '2024-01-22' },
    { id: 3, product: 'USB-C Hub', category: 'Accessories', price: 49, stock: 89, status: 'info', statusLabel: 'In Transit', orderDate: '2024-01-20', deliveryDate: '2024-01-25' },
    { id: 4, product: 'Monitor 27"', category: 'Electronics', price: 399, stock: 23, status: 'warning', statusLabel: 'Low Stock', orderDate: '2024-01-22', deliveryDate: '2024-01-28' },
    { id: 5, product: 'Keyboard RGB', category: 'Accessories', price: 79, stock: 67, status: 'pending', statusLabel: 'Processing', orderDate: '2024-02-01', deliveryDate: '2024-02-05' },
    { id: 6, product: 'Webcam HD', category: 'Electronics', price: 89, stock: 34, status: 'success', statusLabel: 'Delivered', orderDate: '2024-02-05', deliveryDate: '2024-02-10' },
    { id: 7, product: 'Headset Pro', category: 'Audio', price: 159, stock: 56, status: 'info', statusLabel: 'Shipped', orderDate: '2024-02-08', deliveryDate: '2024-02-12' },
    { id: 8, product: 'Desk Lamp', category: 'Office', price: 39, stock: 120, status: 'success', statusLabel: 'Delivered', orderDate: '2024-02-10', deliveryDate: '2024-02-15' },
    { id: 9, product: 'Standing Desk', category: 'Furniture', price: 599, stock: 12, status: 'warning', statusLabel: 'Delayed', orderDate: '2024-02-12', deliveryDate: '2024-02-18' },
    { id: 10, product: 'Office Chair', category: 'Furniture', price: 249, stock: 28, status: 'pending', statusLabel: 'Processing', orderDate: '2024-02-15', deliveryDate: '2024-02-20' },
    { id: 11, product: 'Phone Stand', category: 'Accessories', price: 19, stock: 0, status: 'error', statusLabel: 'Failed', orderDate: '2024-02-18', deliveryDate: '2024-02-25' },
    { id: 12, product: 'USB Cable', category: 'Accessories', price: 12, stock: 200, status: 'cancelled', statusLabel: 'Cancelled', orderDate: '2024-02-20', deliveryDate: '2024-02-24' },
  ];

  const editableColumns = [
    { id: 'id', label: 'ID', filterType: 'number' as const, editable: false },
    { id: 'name', label: 'Name', filterType: 'text' as const, editable: true, editType: 'text' as const },
    { id: 'email', label: 'Email', filterType: 'text' as const, editable: true, editType: 'text' as const },
    {
      id: 'role',
      label: 'Role',
      filterType: 'select' as const,
      editable: true,
      editType: 'select' as const,
      filterOptions: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
        { label: 'Guest', value: 'guest' },
      ]
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'select' as const,
      editable: false,
      filterOptions: [
        { label: 'Active', value: 'success' },
        { label: 'Pending', value: 'pending' },
        { label: 'Inactive', value: 'error' },
      ],
      render: (row: Record<string, any>) => {
        const statusLabels: Record<string, string> = {
          success: 'Active',
          pending: 'Pending',
          error: 'Inactive',
        };
        return <StatusChip status={row.status as StatusType} label={statusLabels[row.status] || row.status} />;
      },
    },
  ];

  const handleSaveRow = async (row: Record<string, any>) => {
    console.log('Saving row:', row);

    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Update local state
        setEditableData((prev) =>
          prev.map((item) => (item.id === row.id ? { ...item, ...row } : item))
        );
        console.log('Row saved successfully');
        resolve();
      }, 500);
    });
  };

  const bulkEditColumns = [
    { id: 'id', label: 'ID', filterType: 'number' as const, editable: false },
    { id: 'product', label: 'Product', filterType: 'text' as const, editable: true, editType: 'text' as const },
    { id: 'price', label: 'Price ($)', filterType: 'number' as const, editable: true, editType: 'number' as const },
    { id: 'quantity', label: 'Quantity', filterType: 'number' as const, editable: true, editType: 'number' as const },
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
      ]
    },
  ];

  const handleBulkSave = async (rows: Record<string, any>[]) => {
    console.log('Bulk saving rows:', rows);

    // Simulate API call
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        // Update local state with all changed rows
        setBulkEditData((prev) =>
          prev.map((item) => {
            const updatedRow = rows.find((r) => r.id === item.id);
            return updatedRow ? { ...item, ...updatedRow } : item;
          })
        );
        console.log('All rows saved successfully');
        resolve();
      }, 1000);
    });
  };

  const tableColumns = [
    { id: 'id', label: 'ID', filterType: 'number' as const },
    { id: 'product', label: 'Product', filterType: 'text' as const },
    {
      id: 'category',
      label: 'Category',
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Accessories', value: 'Accessories' },
        { label: 'Audio', value: 'Audio' },
        { label: 'Office', value: 'Office' },
        { label: 'Furniture', value: 'Furniture' },
      ]
    },
    { id: 'price', label: 'Price ($)', filterType: 'number' as const },
    { id: 'stock', label: 'Stock', filterType: 'number' as const },
    {
      id: 'status',
      label: 'Status',
      filterType: 'select' as const,
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
    { id: 'orderDate', label: 'Order Date', filterType: 'date' as const },
    { id: 'deliveryDate', label: 'Delivery Date', filterType: 'date' as const },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ mb: 1, fontWeight: 600 }}>
        Advanced Features
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Advanced functionality for data management and user interactions
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Status Chips with Glow Effect
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Visual status indicators with animated glow effects for different states
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            <StatusChip status="success" label="SUCCESS" />
            <StatusChip status="error" label="ERROR" />
            <StatusChip status="warning" label="WARNING" />
            <StatusChip status="info" label="INFO" />
            <StatusChip status="pending" label="PENDING" />
            <StatusChip status="cancelled" label="CANCELLED" />
          </Box>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
            <StatusChip status="success" label="Completed" size="medium" />
            <StatusChip status="error" label="Failed" size="medium" />
            <StatusChip status="warning" label="Attention Required" size="medium" />
            <StatusChip status="info" label="In Review" size="medium" />
            <StatusChip status="pending" label="Processing" size="medium" />
            <StatusChip status="cancelled" label="Cancelled" size="medium" />
          </Box>
        </Paper>

        <AdvancedDataTable
          title="Bulk Edit Table (Edit All / Save All)"
          columns={bulkEditColumns}
          data={bulkEditData}
          onBulkSave={handleBulkSave}
          enableBulkEdit={true}
          rowIdField="id"
        />

        <AdvancedDataTable
          title="Single Row Edit Table"
          columns={editableColumns}
          data={editableData}
          onSave={handleSaveRow}
          rowIdField="id"
        />

        <AdvancedDataTable
          title="Advanced Table with Column Filters & Date Range"
          columns={tableColumns}
          data={tableData}
          defaultSortColumn="orderDate"
          defaultSortOrder="desc"
          dateColumn="orderDate"
        />

        <DataExport title="Data Export (CSV, JSON, PDF)" data={exportData} />

        <BulkActions title="Bulk Actions & Selection" data={bulkData} />

        <FileUpload title="File Upload with Progress" />
      </Box>
    </Box>
  );
};

export default AdvancedFeatures;
