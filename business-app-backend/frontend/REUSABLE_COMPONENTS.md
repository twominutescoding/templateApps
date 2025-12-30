# Reusable Components Guide

This guide explains how to reuse the AdvancedDataTable and StatusChip components with your own API data.

## Table of Contents
- [AdvancedDataTable Component](#advanceddatatable-component)
  - [Client-Side Mode](#client-side-mode-small-datasets)
  - [Server-Side Mode](#server-side-mode-large-datasets)
  - [Editable Mode](#editable-mode-inline-editing)
  - [Bulk Edit Mode](#bulk-edit-mode)
- [StatusChip Component](#statuschip-component)
- [Real API Integration Example](#real-api-integration-example)
- [Server-Side Spring Boot Example](#server-side-spring-boot-example)
- [Date Format Configuration](#date-format-configuration)

---

## AdvancedDataTable Component

### Location
`src/components/table/AdvancedDataTable.tsx`

### Features
- **Auto-detection**: Automatically switches between client-side and server-side mode
- **Client-side mode**: For small datasets (< 1000 rows) - filters/sorts in browser
- **Server-side mode**: For large datasets (10,000+ rows) - delegates to backend API
- **Editable mode**: Inline editing with Save/Cancel buttons per row
- **Bulk edit mode**: Edit all visible rows at once with "Edit All" / "Save All" buttons
- Sorting (ascending/descending)
- Column-specific filtering (text, number, select, date)
- Date range filtering with calendar pickers
- Pagination
- Two filter modes: inline and panel
- Custom cell renderers
- Loading spinner for server-side operations
- Responsive design

---

## Client-Side Mode (Small Datasets)

**Use when:** You have < 1000 records that can be loaded into browser memory.

### Basic Usage (Client-Side)

```tsx
import AdvancedDataTable from './components/table/AdvancedDataTable';

const MyComponent = () => {
  // Define your columns
  const columns = [
    {
      id: 'id',
      label: 'ID',
      filterType: 'number'
    },
    {
      id: 'name',
      label: 'Name',
      filterType: 'text'
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'select',
      filterOptions: [
        { label: 'Active', value: 'active' },
        { label: 'Inactive', value: 'inactive' }
      ]
    },
    {
      id: 'createdAt',
      label: 'Created At',
      filterType: 'date'
    },
  ];

  // Your data
  const data = [
    { id: 1, name: 'John Doe', status: 'active', createdAt: '2024-01-15' },
    { id: 2, name: 'Jane Smith', status: 'inactive', createdAt: '2024-02-20' },
  ];

  return (
    <AdvancedDataTable
      title="My Data Table"
      columns={columns}
      data={data}
      defaultSortColumn="createdAt"
      defaultSortOrder="desc"
    />
  );
};
```

### Column Configuration

```tsx
interface Column {
  id: string;                          // Column key in your data
  label: string;                       // Display label
  sortable?: boolean;                  // Enable sorting (default: true)
  filterable?: boolean;                // Enable filtering (default: true)
  filterType?: 'text' | 'select' | 'number' | 'date';
  filterOptions?: Array<{              // For select filters
    label: string;
    value: string;
  }>;
  render?: (row: Record<string, any>) => React.ReactNode;  // Custom renderer
}
```

### Props

```tsx
interface AdvancedDataTableProps {
  title: string;                       // Table title
  columns: Column[];                   // Column definitions
  data: Record<string, any>[];         // Your data array
  defaultSortColumn?: string;          // Initial sort column
  defaultSortOrder?: 'asc' | 'desc';   // Initial sort direction
  dateColumn?: string;                 // Deprecated, use filterType: 'date'
}
```

### Filter Types

#### 1. Text Filter
```tsx
{ id: 'name', label: 'Name', filterType: 'text' }
```
Allows users to search by partial text match (case-insensitive).

#### 2. Number Filter
```tsx
{ id: 'age', label: 'Age', filterType: 'number' }
```
Allows users to filter by exact number.

#### 3. Select Filter (Dropdown)
```tsx
{
  id: 'status',
  label: 'Status',
  filterType: 'select',
  filterOptions: [
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' }
  ]
}
```
Provides a dropdown with predefined options.

#### 4. Date Filter
```tsx
{ id: 'createdAt', label: 'Created At', filterType: 'date' }
```
Provides From/To date pickers with calendar popups.

**Important:** Your date field should be in ISO format: `YYYY-MM-DD` or a valid JavaScript date string.

### Custom Cell Renderer

Use the `render` function to customize how a cell displays:

```tsx
import StatusChip from './components/common/StatusChip';

const columns = [
  {
    id: 'status',
    label: 'Status',
    render: (row) => (
      <StatusChip status={row.statusType} label={row.statusLabel} />
    )
  }
];
```

---

## Server-Side Mode (Large Datasets)

**Use when:** You have 10,000+ records that shouldn't all be loaded into browser memory.

The table **automatically detects** server-side mode when you provide the `onFetchData` prop.

### How It Works

1. User changes filter/sort/page → Table calls `onFetchData()` with parameters
2. You fetch from your API with those parameters
3. Update `data` prop with the new page of results
4. Set `loading={true}` while fetching

### Basic Usage (Server-Side)

```tsx
import { useState } from 'react';
import AdvancedDataTable, { FetchParams } from './components/table/AdvancedDataTable';

const MyComponent = () => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const columns = [
    { id: 'id', label: 'ID', filterType: 'number' },
    { id: 'name', label: 'Name', filterType: 'text' },
    { id: 'status', label: 'Status', filterType: 'select', filterOptions: [...] },
    { id: 'createdAt', label: 'Created', filterType: 'date' },
  ];

  const handleFetchData = async (params: FetchParams) => {
    setLoading(true);
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page.toString());
      queryParams.append('size', params.pageSize.toString());
      queryParams.append('sort', `${params.sort.column},${params.sort.order}`);

      // Add filters
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) queryParams.append(`filter_${key}`, value);
      });

      // Add date range filters
      Object.entries(params.dateRanges).forEach(([key, range]) => {
        if (range.from) queryParams.append(`${key}_from`, range.from);
        if (range.to) queryParams.append(`${key}_to`, range.to);
      });

      const response = await fetch(`/api/orders?${queryParams}`);
      const result = await response.json();

      setData(result.content);  // Current page data
      setTotalRecords(result.totalElements);  // Total count
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdvancedDataTable
      title="Orders"
      columns={columns}
      data={data}
      onFetchData={handleFetchData}  // ← Enables server-side mode
      totalRecords={totalRecords}
      loading={loading}
      defaultSortColumn="createdAt"
      defaultSortOrder="desc"
    />
  );
};
```

### FetchParams Interface

When `onFetchData` is called, you receive these parameters:

```tsx
interface FetchParams {
  filters: Record<string, string>;  // { status: 'active', name: 'John' }
  dateRanges: Record<string, {      // { createdAt: { from: '2024-01-01', to: '2024-12-31' } }
    from: string | null;
    to: string | null;
  }>;
  sort: {
    column: string;  // 'createdAt'
    order: 'asc' | 'desc';  // 'desc'
  };
  page: number;      // 0
  pageSize: number;  // 20
}
```

---

## Editable Mode (Inline Editing)

**Use when:** You need to allow users to edit table rows with inline form controls.

### Features
- Click Edit button to enable editing for a row
- Inline form inputs (text, number, select, date)
- Save/Cancel buttons per row
- Only one row editable at a time
- Automatic refetch in server-side mode after save
- Integration with your API via `onSave` callback

### Basic Usage

```tsx
import { useState } from 'react';
import AdvancedDataTable from './components/table/AdvancedDataTable';

const MyComponent = () => {
  const [data, setData] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'admin' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  ]);

  const columns = [
    {
      id: 'id',
      label: 'ID',
      filterType: 'number',
      editable: false  // ID cannot be edited
    },
    {
      id: 'name',
      label: 'Name',
      filterType: 'text',
      editable: true,
      editType: 'text'
    },
    {
      id: 'email',
      label: 'Email',
      filterType: 'text',
      editable: true,
      editType: 'text'
    },
    {
      id: 'role',
      label: 'Role',
      filterType: 'select',
      editable: true,
      editType: 'select',
      filterOptions: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
      ]
    },
  ];

  const handleSaveRow = async (row: Record<string, any>) => {
    console.log('Saving row:', row);

    // Update local state (for client-side mode)
    setData((prev) =>
      prev.map((item) => (item.id === row.id ? { ...item, ...row } : item))
    );

    // Or make API call
    // await fetch(`/api/users/${row.id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(row)
    // });
  };

  return (
    <AdvancedDataTable
      title="Editable Users Table"
      columns={columns}
      data={data}
      onSave={handleSaveRow}
      rowIdField="id"  // default is 'id'
    />
  );
};
```

### Column Configuration for Editable Mode

```tsx
interface Column {
  id: string;
  label: string;
  editable?: boolean;  // Can this column be edited? (default: false)
  editType?: 'text' | 'select' | 'number' | 'date';  // Input type when editing
  filterType?: 'text' | 'select' | 'number' | 'date';
  filterOptions?: { label: string; value: string }[];  // Required for select editType
  render?: (row: Record<string, any>) => React.ReactNode;
}
```

### Props for Editable Mode

```tsx
interface AdvancedDataTableProps {
  // ... other props

  // Editable mode props
  onSave?: (row: Record<string, any>) => Promise<void>;  // Callback when Save is clicked
  rowIdField?: string;  // Field name for row ID (default: 'id')
}
```

### Edit Types

1. **Text** (`editType: 'text'`)
   - Renders a TextField
   - Good for names, descriptions, etc.

2. **Number** (`editType: 'number'`)
   - Renders a TextField with type="number"
   - Good for quantities, prices, etc.

3. **Select** (`editType: 'select'`)
   - Renders a Select dropdown
   - Requires `filterOptions` to be defined
   - Good for status, category, role, etc.

4. **Date** (`editType: 'date'`)
   - Renders a DatePicker with global date format
   - Good for dates

### Real-World Example with API

```tsx
import { useState, useCallback } from 'react';
import AdvancedDataTable from './components/table/AdvancedDataTable';

const UsersTable = () => {
  const [users, setUsers] = useState([]);

  const columns = [
    { id: 'id', label: 'ID', editable: false },
    { id: 'name', label: 'Name', editable: true, editType: 'text' as const },
    { id: 'email', label: 'Email', editable: true, editType: 'text' as const },
    {
      id: 'role',
      label: 'Role',
      editable: true,
      editType: 'select' as const,
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Admin', value: 'admin' },
        { label: 'User', value: 'user' },
        { label: 'Guest', value: 'guest' },
      ],
    },
    {
      id: 'status',
      label: 'Status',
      editable: false,  // Status is read-only
      render: (row) => <StatusChip status={row.status} label={row.statusLabel} />
    },
  ];

  const handleSaveRow = useCallback(async (row: Record<string, any>) => {
    try {
      // Call your API
      const response = await fetch(`/api/users/${row.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row),
      });

      if (!response.ok) {
        throw new Error('Failed to save');
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) => (user.id === row.id ? { ...user, ...row } : user))
      );
    } catch (error) {
      console.error('Error saving row:', error);
      alert('Failed to save changes');
      throw error; // Re-throw to keep edit mode active
    }
  }, []);

  return (
    <AdvancedDataTable
      title="Users"
      columns={columns}
      data={users}
      onSave={handleSaveRow}
    />
  );
};
```

### Spring Boot Backend for Editable Table

In Spring Boot, you can use a single endpoint for both creating and updating:

```java
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // Single endpoint for both POST (create) and PUT (update)
    @PutMapping("/{id}")
    public ResponseEntity<User> saveUser(@PathVariable Long id, @RequestBody User user) {
        // Check if user exists
        Optional<User> existingUser = userRepository.findById(id);

        if (existingUser.isPresent()) {
            // Update existing user
            User updated = existingUser.get();
            updated.setName(user.getName());
            updated.setEmail(user.getEmail());
            updated.setRole(user.getRole());
            // Don't update status or other read-only fields

            return ResponseEntity.ok(userRepository.save(updated));
        } else {
            // Create new user
            user.setId(id);
            return ResponseEntity.status(HttpStatus.CREATED)
                .body(userRepository.save(user));
        }
    }
}
```

### Combining Editable Mode with Server-Side Mode

You can use both editable mode and server-side mode together:

```tsx
const [data, setData] = useState([]);
const [loading, setLoading] = useState(false);
const [totalRecords, setTotalRecords] = useState(0);

const handleFetchData = async (params: FetchParams) => {
  setLoading(true);
  try {
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const result = await response.json();
    setData(result.content);
    setTotalRecords(result.totalElements);
  } finally {
    setLoading(false);
  }
};

const handleSaveRow = async (row: Record<string, any>) => {
  await fetch(`/api/users/${row.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(row),
  });
  // Table will automatically refetch after save
};

return (
  <AdvancedDataTable
    title="Users"
    columns={columns}
    data={data}
    onFetchData={handleFetchData}  // Server-side mode
    onSave={handleSaveRow}          // Editable mode
    totalRecords={totalRecords}
    loading={loading}
  />
);
```

### Bulk Edit Mode

**Use when:** You need to edit multiple rows at once with a single "Save All" action.

#### Features
- Click "Edit All" button to enable editing for all visible rows
- All rows become editable simultaneously
- Single "Save All" button to commit all changes at once
- "Cancel All" button to discard all changes
- Uses `onBulkSave` callback for batch API operations
- Falls back to individual `onSave` calls if `onBulkSave` not provided

#### Basic Usage

```tsx
import { useState } from 'react';
import AdvancedDataTable from './components/table/AdvancedDataTable';

const ProductsTable = () => {
  const [products, setProducts] = useState([
    { id: 1, product: 'Laptop', price: 1299, quantity: 5, category: 'Electronics' },
    { id: 2, product: 'Mouse', price: 29, quantity: 150, category: 'Accessories' },
    { id: 3, product: 'Monitor', price: 399, quantity: 23, category: 'Electronics' },
  ]);

  const columns = [
    { id: 'id', label: 'ID', editable: false },
    { id: 'product', label: 'Product', editable: true, editType: 'text' as const },
    { id: 'price', label: 'Price', editable: true, editType: 'number' as const },
    { id: 'quantity', label: 'Quantity', editable: true, editType: 'number' as const },
    {
      id: 'category',
      label: 'Category',
      editable: true,
      editType: 'select' as const,
      filterOptions: [
        { label: 'Electronics', value: 'Electronics' },
        { label: 'Accessories', value: 'Accessories' },
      ]
    },
  ];

  const handleBulkSave = async (rows: Record<string, any>[]) => {
    console.log('Saving all rows:', rows);

    // Call bulk update API
    await fetch('/api/products/bulk-update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ products: rows }),
    });

    // Update local state
    setProducts((prev) =>
      prev.map((item) => {
        const updated = rows.find((r) => r.id === item.id);
        return updated ? { ...item, ...updated } : item;
      })
    );
  };

  return (
    <AdvancedDataTable
      title="Products"
      columns={columns}
      data={products}
      onBulkSave={handleBulkSave}
      enableBulkEdit={true}
      rowIdField="id"
    />
  );
};
```

#### Props for Bulk Edit Mode

```tsx
interface AdvancedDataTableProps {
  // ... other props

  // Bulk edit mode props
  onBulkSave?: (rows: Record<string, any>[]) => Promise<void>;  // Callback for bulk save
  enableBulkEdit?: boolean;  // Enable bulk edit mode (default: false)
}
```

#### Spring Boot Backend for Bulk Edit

```java
@RestController
@RequestMapping("/api/products")
public class ProductController {

    @Autowired
    private ProductRepository productRepository;

    @PutMapping("/bulk-update")
    public ResponseEntity<List<Product>> bulkUpdate(@RequestBody BulkUpdateRequest request) {
        List<Product> updatedProducts = new ArrayList<>();

        for (ProductDto dto : request.getProducts()) {
            Optional<Product> existing = productRepository.findById(dto.getId());
            if (existing.isPresent()) {
                Product product = existing.get();
                product.setProduct(dto.getProduct());
                product.setPrice(dto.getPrice());
                product.setQuantity(dto.getQuantity());
                product.setCategory(dto.getCategory());
                updatedProducts.add(productRepository.save(product));
            }
        }

        return ResponseEntity.ok(updatedProducts);
    }
}

// DTO class
class BulkUpdateRequest {
    private List<ProductDto> products;
    // getters/setters
}

class ProductDto {
    private Long id;
    private String product;
    private Double price;
    private Integer quantity;
    private String category;
    // getters/setters
}
```

#### Differences: Single Row Edit vs Bulk Edit

| Feature | Single Row Edit | Bulk Edit |
|---------|----------------|-----------|
| Activation | Click Edit button on a row | Click "Edit All" button above table |
| Editable rows | One row at a time | All visible rows at once |
| Save action | "Save" button per row | Single "Save All" button above table |
| Cancel action | "Cancel" button per row | Single "Cancel All" button above table |
| API callback | `onSave(row)` | `onBulkSave(rows[])` |
| Actions column | Yes (with Edit/Save/Cancel buttons) | No (uses top buttons) |
| Use case | Quick single updates | Batch price updates, quantity adjustments |

#### Combining Bulk Edit with Pagination

Bulk edit only affects visible rows on the current page:

```tsx
// If you're on page 1 with 10 rows per page, clicking "Edit All"
// will make only those 10 rows editable.
// Navigate to page 2 to edit the next batch.

<AdvancedDataTable
  title="Products"
  columns={columns}
  data={products}
  onBulkSave={handleBulkSave}
  enableBulkEdit={true}
  // Pagination settings
  defaultSortColumn="id"
  defaultSortOrder="asc"
/>
```

#### Important Notes

- **Bulk edit works on current page only**: Only rows visible on the current page are editable
- **Falls back gracefully**: If `onBulkSave` not provided, uses `onSave` for each row individually
- **Server-side compatible**: Works with both client-side and server-side modes
- **Auto-refetch**: In server-side mode, automatically refetches data after bulk save
- **No Actions column**: When `enableBulkEdit` is true, the Actions column is hidden

---

## StatusChip Component

### Location
`src/components/common/StatusChip.tsx`

### Available Status Types

```tsx
type StatusType = 'success' | 'error' | 'warning' | 'info' | 'pending' | 'cancelled';
```

| Status | Color | Use Case |
|--------|-------|----------|
| `success` | Green | Completed, Delivered, Success |
| `error` | Red | Failed, Error, Rejected |
| `warning` | Orange | Delayed, Low Stock, Attention Required |
| `info` | Blue | In Transit, Shipped, In Progress |
| `pending` | Gray | Processing, Pending, Waiting |
| `cancelled` | Blue-Gray | Cancelled, Terminated |

### Basic Usage

```tsx
import StatusChip from './components/common/StatusChip';

<StatusChip status="success" label="Completed" />
<StatusChip status="error" label="Failed" size="medium" />
```

### Props

```tsx
interface StatusChipProps {
  status: StatusType;      // Status type (success, error, warning, info, pending, cancelled)
  label: string;           // Display text
  size?: 'small' | 'medium';  // Chip size (default: 'small')
}
```

### Features
- **Animated glow effect** - Pulses every 2 seconds
- **Color-coded** - Different colors for different statuses
- **Icons** - Each status has a matching icon
- **Customizable size** - Small or medium

---

## Real API Integration Example

### Scenario: E-commerce Order Management

```tsx
import { useState, useEffect } from 'react';
import AdvancedDataTable from './components/table/AdvancedDataTable';
import StatusChip from './components/common/StatusChip';
import type { StatusType } from './components/common/StatusChip';

interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: string;
  statusType: StatusType;
  orderDate: string;
  deliveryDate: string;
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from your API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch('https://api.yourapp.com/orders');
        const data = await response.json();

        // Transform API data to match your needs
        const transformedOrders = data.map((order: any) => ({
          id: order.id,
          orderNumber: order.order_number,
          customerName: order.customer.name,
          totalAmount: order.total,
          status: order.status,
          statusType: mapOrderStatusToChipType(order.status),
          statusLabel: formatStatusLabel(order.status),
          orderDate: order.created_at,
          deliveryDate: order.estimated_delivery,
        }));

        setOrders(transformedOrders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Map your API status to StatusChip types
  const mapOrderStatusToChipType = (status: string): StatusType => {
    const statusMap: Record<string, StatusType> = {
      'delivered': 'success',
      'failed': 'error',
      'delayed': 'warning',
      'in_transit': 'info',
      'processing': 'pending',
      'cancelled': 'cancelled',
    };
    return statusMap[status] || 'pending';
  };

  // Format status for display
  const formatStatusLabel = (status: string): string => {
    return status.split('_').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const columns = [
    {
      id: 'id',
      label: 'ID',
      filterType: 'number' as const
    },
    {
      id: 'orderNumber',
      label: 'Order #',
      filterType: 'text' as const
    },
    {
      id: 'customerName',
      label: 'Customer',
      filterType: 'text' as const
    },
    {
      id: 'totalAmount',
      label: 'Amount ($)',
      filterType: 'number' as const,
      render: (row) => `$${row.totalAmount.toFixed(2)}`
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Delivered', value: 'delivered' },
        { label: 'In Transit', value: 'in_transit' },
        { label: 'Processing', value: 'processing' },
        { label: 'Delayed', value: 'delayed' },
        { label: 'Failed', value: 'failed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      render: (row) => (
        <StatusChip
          status={row.statusType as StatusType}
          label={row.statusLabel}
        />
      ),
    },
    {
      id: 'orderDate',
      label: 'Order Date',
      filterType: 'date' as const
    },
    {
      id: 'deliveryDate',
      label: 'Delivery Date',
      filterType: 'date' as const
    },
  ];

  if (loading) {
    return <div>Loading orders...</div>;
  }

  return (
    <AdvancedDataTable
      title="Order Management"
      columns={columns}
      data={orders}
      defaultSortColumn="orderDate"
      defaultSortOrder="desc"
    />
  );
};

export default OrderManagement;
```

### API Response Example

```json
{
  "orders": [
    {
      "id": 1001,
      "order_number": "ORD-2024-1001",
      "customer": {
        "id": 42,
        "name": "John Doe",
        "email": "john@example.com"
      },
      "total": 299.99,
      "status": "delivered",
      "created_at": "2024-01-15T10:30:00Z",
      "estimated_delivery": "2024-01-20T00:00:00Z"
    },
    {
      "id": 1002,
      "order_number": "ORD-2024-1002",
      "customer": {
        "id": 43,
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "total": 149.50,
      "status": "in_transit",
      "created_at": "2024-02-10T14:20:00Z",
      "estimated_delivery": "2024-02-15T00:00:00Z"
    }
  ]
}
```

### Data Transformation Tips

1. **Date Format**: Ensure dates are in ISO format (`YYYY-MM-DD`) or JavaScript Date-parseable format
2. **Status Mapping**: Create a mapping function to convert your API status codes to StatusChip types
3. **Column IDs**: Use camelCase for column IDs to match JavaScript conventions
4. **Custom Renderers**: Use `render` function for complex displays (currency, status chips, links, etc.)

---

## Server-Side Spring Boot Example

Complete example showing Spring Boot backend with the table's server-side mode.

### Spring Boot Controller

```java
@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @GetMapping
    public Page<OrderDTO> getOrders(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String sort,
        @RequestParam(required = false) Map<String, String> filters
    ) {
        // Parse sort parameter (format: "column,order")
        Sort sortObj = Sort.unsorted();
        if (sort != null && !sort.isEmpty()) {
            String[] sortParts = sort.split(",");
            String column = sortParts[0];
            String order = sortParts.length > 1 ? sortParts[1] : "asc";
            sortObj = Sort.by(
                order.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                column
            );
        }

        Pageable pageable = PageRequest.of(page, size, sortObj);

        // Build specification from filters
        Specification<Order> spec = buildSpecification(filters);

        return orderRepository.findAll(spec, pageable)
            .map(this::convertToDTO);
    }

    private Specification<Order> buildSpecification(Map<String, String> filters) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filters != null) {
                // Text filters (partial match)
                if (filters.containsKey("filter_orderNumber")) {
                    predicates.add(cb.like(
                        cb.lower(root.get("orderNumber")),
                        "%" + filters.get("filter_orderNumber").toLowerCase() + "%"
                    ));
                }

                if (filters.containsKey("filter_customerName")) {
                    predicates.add(cb.like(
                        cb.lower(root.get("customerName")),
                        "%" + filters.get("filter_customerName").toLowerCase() + "%"
                    ));
                }

                // Select filters (exact match)
                if (filters.containsKey("filter_status")) {
                    predicates.add(cb.equal(
                        root.get("status"),
                        filters.get("filter_status")
                    ));
                }

                // Date range filters
                if (filters.containsKey("orderDate_from")) {
                    LocalDate fromDate = LocalDate.parse(filters.get("orderDate_from"));
                    predicates.add(cb.greaterThanOrEqualTo(
                        root.get("orderDate"),
                        fromDate
                    ));
                }

                if (filters.containsKey("orderDate_to")) {
                    LocalDate toDate = LocalDate.parse(filters.get("orderDate_to"));
                    predicates.add(cb.lessThanOrEqualTo(
                        root.get("orderDate"),
                        toDate
                    ));
                }

                if (filters.containsKey("deliveryDate_from")) {
                    LocalDate fromDate = LocalDate.parse(filters.get("deliveryDate_from"));
                    predicates.add(cb.greaterThanOrEqualTo(
                        root.get("deliveryDate"),
                        fromDate
                    ));
                }

                if (filters.containsKey("deliveryDate_to")) {
                    LocalDate toDate = LocalDate.parse(filters.get("deliveryDate_to"));
                    predicates.add(cb.lessThanOrEqualTo(
                        root.get("deliveryDate"),
                        toDate
                    ));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private OrderDTO convertToDTO(Order order) {
        return OrderDTO.builder()
            .id(order.getId())
            .orderNumber(order.getOrderNumber())
            .customerName(order.getCustomer().getName())
            .totalAmount(order.getTotalAmount())
            .status(order.getStatus())
            .orderDate(order.getOrderDate().toString())
            .deliveryDate(order.getDeliveryDate().toString())
            .build();
    }
}
```

### Response Format

```json
{
  "content": [
    {
      "id": 1,
      "orderNumber": "ORD-001",
      "customerName": "John Doe",
      "totalAmount": 299.99,
      "status": "delivered",
      "orderDate": "2024-01-15",
      "deliveryDate": "2024-01-20"
    }
  ],
  "totalElements": 10000,
  "totalPages": 500,
  "number": 0,
  "size": 20,
  "numberOfElements": 20
}
```

### React Frontend with Spring Boot

```tsx
import { useState } from 'react';
import AdvancedDataTable, { FetchParams } from './components/table/AdvancedDataTable';
import StatusChip from './components/common/StatusChip';

const OrdersPage = () => {
  const [data, setData] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleFetchData = async (params: FetchParams) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', params.page.toString());
      queryParams.append('size', params.pageSize.toString());
      queryParams.append('sort', `${params.sort.column},${params.sort.order}`);

      // Add text/select filters
      Object.entries(params.filters).forEach(([key, value]) => {
        if (value) queryParams.append(`filter_${key}`, value);
      });

      // Add date range filters
      Object.entries(params.dateRanges).forEach(([key, range]) => {
        if (range.from) queryParams.append(`${key}_from`, range.from);
        if (range.to) queryParams.append(`${key}_to`, range.to);
      });

      const response = await fetch(`/api/orders?${queryParams}`);
      const result = await response.json();

      setData(result.content);
      setTotalRecords(result.totalElements);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { id: 'id', label: 'ID', filterType: 'number' as const },
    { id: 'orderNumber', label: 'Order #', filterType: 'text' as const },
    { id: 'customerName', label: 'Customer', filterType: 'text' as const },
    {
      id: 'totalAmount',
      label: 'Amount',
      filterType: 'number' as const,
      render: (row) => `$${row.totalAmount.toFixed(2)}`
    },
    {
      id: 'status',
      label: 'Status',
      filterType: 'select' as const,
      filterOptions: [
        { label: 'Delivered', value: 'delivered' },
        { label: 'In Transit', value: 'in_transit' },
        { label: 'Processing', value: 'processing' },
      ],
      render: (row) => (
        <StatusChip
          status={mapStatus(row.status)}
          label={formatStatus(row.status)}
        />
      )
    },
    { id: 'orderDate', label: 'Order Date', filterType: 'date' as const },
    { id: 'deliveryDate', label: 'Delivery Date', filterType: 'date' as const },
  ];

  return (
    <AdvancedDataTable
      title="Orders"
      columns={columns}
      data={data}
      onFetchData={handleFetchData}
      totalRecords={totalRecords}
      loading={loading}
      defaultSortColumn="orderDate"
      defaultSortOrder="desc"
    />
  );
};
```

### Key Points

1. **Backend handles**: Filtering, sorting, pagination
2. **Frontend sends**: Filter values, sort column/order, page number
3. **Response includes**: `totalElements` (for pagination), `content` (current page data)
4. **Performance**: Only 20 records loaded at a time (not all 10,000)

---

## Date Format Configuration

### Global Date Format Setting

Users can change the global date format in Settings → Appearance:
- `DD.MM.YYYY` (20.02.2024)
- `MM/DD/YYYY` (02/20/2024)
- `YYYY-MM-DD` (2024-02-20)

### Programmatic Access

```tsx
import { useDateFormat } from './context/DateFormatContext';

const MyComponent = () => {
  const { formatDate, dateFormat, setDateFormat } = useDateFormat();

  // Format a date
  const formattedDate = formatDate(new Date('2024-02-20'));
  // Returns: "20.02.2024" (if format is DD.MM.YYYY)

  // Get current format
  console.log(dateFormat); // "DD.MM.YYYY" | "MM/DD/YYYY" | "YYYY-MM-DD"

  // Change format programmatically
  setDateFormat('MM/DD/YYYY');
};
```

---

## Advanced Examples

### Multiple Date Columns with Different Filters

```tsx
const columns = [
  { id: 'createdAt', label: 'Created', filterType: 'date' as const },
  { id: 'updatedAt', label: 'Updated', filterType: 'date' as const },
  { id: 'completedAt', label: 'Completed', filterType: 'date' as const },
];
```

Each date column will have its own independent From/To date pickers.

### Complex Custom Renderer

```tsx
{
  id: 'user',
  label: 'User',
  render: (row) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Avatar src={row.avatarUrl} alt={row.userName} />
      <Box>
        <Typography variant="body2">{row.userName}</Typography>
        <Typography variant="caption" color="text.secondary">
          {row.userEmail}
        </Typography>
      </Box>
    </Box>
  )
}
```

### Conditional Status Mapping

```tsx
const getStatusFromValue = (value: number): StatusType => {
  if (value >= 90) return 'success';
  if (value >= 70) return 'info';
  if (value >= 50) return 'warning';
  return 'error';
};

const columns = [
  {
    id: 'score',
    label: 'Score',
    render: (row) => (
      <StatusChip
        status={getStatusFromValue(row.score)}
        label={`${row.score}%`}
      />
    )
  }
];
```

---

## Tips and Best Practices

1. **Keep data flat**: The table works best with flat data structures. Nest complex objects only in custom renderers.

2. **Date handling**: Always ensure dates from your API are in a format JavaScript's `Date` constructor can parse (ISO 8601 is recommended).

3. **Filter options**: For select filters, ensure the `value` in `filterOptions` matches the actual data values.

4. **Performance**: For large datasets (>1000 rows), consider implementing server-side pagination and filtering.

5. **Type safety**: Use TypeScript interfaces for your data to catch errors early:

```tsx
interface MyData {
  id: number;
  name: string;
  status: StatusType;
  createdAt: string;
}

const data: MyData[] = await fetchData();
```

6. **Status consistency**: Define your status types in a central location:

```tsx
// types/status.ts
export const ORDER_STATUSES = {
  DELIVERED: 'success',
  IN_TRANSIT: 'info',
  PROCESSING: 'pending',
  DELAYED: 'warning',
  FAILED: 'error',
  CANCELLED: 'cancelled',
} as const;
```

---

## Troubleshooting

### Date filters not working
- Ensure your date data is in `YYYY-MM-DD` format or a valid Date string
- Check that the column has `filterType: 'date'`

### Custom renderer not displaying
- Verify the `render` function returns valid React elements
- Check console for any JavaScript errors

### Filter dropdown empty
- Ensure `filterOptions` array is properly defined with `label` and `value`
- Verify the `filterType` is set to `'select'`

### Status chips not showing
- Import `StatusChip` component correctly
- Ensure status type is one of the valid `StatusType` values
- Check that the data includes both status type and label

---

## Support

For more examples, check:
- `src/pages/components/AdvancedFeatures.tsx` - Complete working example
- `src/components/table/AdvancedDataTable.tsx` - Component implementation
- `src/components/common/StatusChip.tsx` - Status chip implementation
