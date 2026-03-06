# Business App Frontend

React 19 + TypeScript + Vite frontend for the business-app-backend template.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (http://localhost:5173)
npm run dev

# Build for production (outputs to ../src/main/resources/static/)
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint

# Type check
npx tsc --noEmit
```

**Requirements**: Auth service must be running on port 8091.

**Login credentials** (from auth-service):
- Admin: `admin` / `password`
- User: `user1` / `password`

## Tech Stack

- React 19.2 with TypeScript
- Material-UI v7
- Vite (HMR, fast builds)
- Axios (API client with automatic token refresh)

## Folder Structure

```
src/
├── components/
│   ├── auth/            # ProtectedRoute
│   ├── common/          # CustomPaletteEditor, DateRangeFilter, StatusChip
│   ├── layout/          # Header, Layout, Sidebar
│   └── table/           # AdvancedDataTable (inline & bulk editing)
├── context/
│   └── DateFormatContext.tsx    # User-configurable date/timestamp formats
├── contexts/
│   └── AuthContext.tsx           # JWT authentication state
├── pages/
│   ├── demo/
│   │   └── DemoProductsPage.tsx  # Example CRUD page (safe to delete)
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   └── Settings.tsx
├── services/
│   └── api.ts                    # Axios client with automatic token refresh
├── theme/
│   └── ThemeContext.tsx          # Dark mode & custom color palettes
├── types/
│   └── palette.ts
└── App.tsx
```

## Key Components

### AdvancedDataTable

Reusable table with server-side pagination, filtering, sorting, inline editing, and bulk editing.

**CRITICAL for performance** — always wrap props in `useMemo`/`useCallback`:

```tsx
const columns = useMemo(() => [
  { id: 'name', label: 'Name', filterType: 'text' as const, editable: true },
  { id: 'createdAt', label: 'Created', filterType: 'date' as const },
], [formatTimestamp]);

const fetchData = useCallback(async (params) => {
  // fetch logic
}, []);
```

### Date/Timestamp Formatting

User-configurable from Settings page:

```tsx
const { formatDate, formatTimestamp } = useDateFormat();
formatDate(new Date());           // "07.12.2025"
formatTimestamp(new Date());      // "07.12.2025 14:30:45"
```

### Theme System

- Dark mode toggle (persisted in localStorage)
- Predefined palettes: Ocean Blue, Sunset Orange, Forest Green, Royal Purple, Cherry Red, Midnight Dark
- Custom palettes (user-created, stored in localStorage)

## Authentication

JWT authentication is handled automatically:
- Access tokens (15 min) stored in localStorage
- Axios interceptor auto-refreshes on 401 errors
- Refresh tokens managed by auth-service (24-hour default, configurable)
- Graceful logout if refresh fails

## Adding New Pages

1. Create a page in `pages/` using `AdvancedDataTable`
2. Add route in `App.tsx`
3. Add sidebar link in `components/layout/Sidebar.tsx`

**Pattern**: See `DemoProductsPage.tsx` as a reference implementation.

## Removing Demo Code

When ready for production:
```bash
# Remove demo backend package
rm -rf ../src/main/java/com/template/business/demo/

# Remove demo route from App.tsx and Sidebar.tsx
```

## Reusable Components

See [REUSABLE_COMPONENTS.md](REUSABLE_COMPONENTS.md) for detailed documentation on shared components (AdvancedDataTable, StatusChip, DateRangeFilter, CustomPaletteEditor).
