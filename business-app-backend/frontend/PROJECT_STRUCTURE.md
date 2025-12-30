# Business App Template - Project Structure

## Overview
This is a modern React business application template built with TypeScript, Vite, and Material-UI. It features a well-organized folder structure, reusable components, and mock data for rapid prototyping.

## Tech Stack
- **React 19** - UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Material-UI (MUI) v7** - Component library
- **React Router DOM v7** - Client-side routing
- **Emotion** - CSS-in-JS styling

## Folder Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic reusable components
│   │   ├── DataTable.tsx    # Paginated table component
│   │   └── StatCard.tsx     # Statistics card with trends
│   ├── layout/         # Layout components
│   │   ├── Header.tsx       # App header with navigation
│   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   └── Layout.tsx       # Main layout wrapper
│   └── features/       # Feature-specific components (future)
│
├── pages/              # Page components (route components)
│   ├── Dashboard.tsx        # Main dashboard with stats
│   ├── Customers.tsx        # Customer list page
│   ├── Orders.tsx           # Orders management page
│   ├── Products.tsx         # Product catalog page
│   ├── Analytics.tsx        # Analytics and reports page
│   └── Settings.tsx         # Settings page
│
├── data/               # Data layer
│   └── mock/          # Mock data for development
│       ├── users.ts         # Mock user data
│       ├── products.ts      # Mock product data
│       ├── orders.ts        # Mock order data
│       ├── analytics.ts     # Mock analytics data
│       └── index.ts         # Barrel export
│
├── types/              # TypeScript type definitions
│   └── index.ts            # All type definitions
│
├── theme/              # Theme configuration
│   └── theme.ts            # MUI theme customization
│
├── hooks/              # Custom React hooks (future)
├── services/           # API services (future)
├── utils/              # Utility functions (future)
├── config/             # App configuration (future)
└── assets/             # Static assets
    ├── images/
    └── icons/
```

## Key Features

### 1. Reusable Components
- **DataTable**: Generic, type-safe table component with pagination
- **StatCard**: Display key metrics with optional trend indicators
- **Layout System**: Consistent app structure with header and sidebar

### 2. Type Safety
All components use TypeScript interfaces:
- `User` - User/customer data model
- `Product` - Product information
- `Order` - Order details with items
- `Analytics` - Business metrics
- `TableColumn<T>` - Generic table column definition

### 3. Routing
Uses React Router v7 with the following routes:
- `/` - Dashboard
- `/customers` - Customer list
- `/orders` - Order management
- `/products` - Product catalog
- `/analytics` - Analytics overview
- `/settings` - Application settings

### 4. Theme Customization
Custom MUI theme with:
- Professional color palette
- Consistent typography
- Custom component styles
- Responsive design tokens

## Getting Started

### Development
```bash
npm run dev
```
Starts the development server at `http://localhost:5173`

### Build
```bash
npm run build
```
Creates optimized production build in `dist/`

### Preview
```bash
npm run preview
```
Preview the production build locally

## Component Usage Examples

### Using DataTable
```typescript
import DataTable from '../components/common/DataTable';
import type { TableColumn, User } from '../types';

const columns: TableColumn<User>[] = [
  { id: 'name', label: 'Name', minWidth: 170 },
  { id: 'email', label: 'Email', minWidth: 200 },
];

<DataTable columns={columns} data={users} rowsPerPageOptions={[5, 10, 25]} />
```

### Using StatCard
```typescript
import StatCard from '../components/common/StatCard';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

<StatCard
  title="Total Revenue"
  value="$5,999.87"
  icon={<AttachMoneyIcon sx={{ fontSize: 32, color: '#1976d2' }} />}
  trend={15.8}
  color="#1976d2"
/>
```

## Adding New Features

### Adding a New Page
1. Create component in `src/pages/YourPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation item in `src/components/layout/Sidebar.tsx`

### Adding New Mock Data
1. Create data file in `src/data/mock/yourData.ts`
2. Define types in `src/types/index.ts`
3. Export from `src/data/mock/index.ts`

### Creating Reusable Components
1. Common components go in `src/components/common/`
2. Feature-specific components go in `src/components/features/`
3. Export TypeScript interfaces for props

## Next Steps

### Recommended Enhancements
- [ ] Add authentication/authorization
- [ ] Connect to real API (replace mock data)
- [ ] Add form validation with React Hook Form
- [ ] Implement state management (Redux/Zustand)
- [ ] Add charts and visualizations
- [ ] Implement dark mode toggle
- [ ] Add unit tests with Vitest
- [ ] Add E2E tests with Playwright
- [ ] Implement error boundaries
- [ ] Add loading states and skeletons

## Notes
- No security implementation (as requested)
- Uses mock data for all content
- Designed for easy extension and customization
- Follows React and TypeScript best practices
