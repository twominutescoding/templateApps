# Business App Template - Claude Code Session Notes

## Project Overview

This is a comprehensive business application template with:
- **Backend**: Spring Boot 3.4.0 (Java 21)
- **Frontend**: React 19 with TypeScript and Vite
- **Database**: H2 (in-memory) for development
- **Authentication**: JWT-based stateless authentication
- **UI Library**: Material-UI (MUI) v7

## Project Structure

### Backend (`/src/main/java/com/template/business/`)

```
business/
├── config/              # Configuration classes
│   ├── DataInitializer.java    # Initializes demo data on startup
│   ├── JwtAuthenticationFilter.java
│   ├── SecurityConfig.java
│   └── WebConfig.java
├── controller/          # REAL business controllers (currently empty - ready for real entities)
├── demo/                # DEMO package - separated from real business logic
│   ├── controller/
│   │   └── DemoProductController.java
│   ├── dto/
│   │   └── DemoProductDTO.java
│   ├── entity/
│   │   └── DemoProduct.java
│   ├── repository/
│   │   └── DemoProductRepository.java
│   └── service/
│       └── DemoProductService.java
├── dto/                 # Common DTOs
│   ├── ApiResponse.java
│   ├── PageResponse.java
│   ├── SearchRequest.java
│   └── AuthDTO.java
├── entity/              # REAL business entities (currently has BaseEntity, User)
│   ├── BaseEntity.java
│   └── User.java
├── repository/          # REAL business repositories
│   └── UserRepository.java
├── service/             # REAL business services
│   ├── AuthService.java
│   └── JwtService.java
└── util/                # Utility classes
    └── JwtUtil.java
```

### Frontend (`/frontend/src/`)

```
src/
├── components/
│   ├── auth/
│   │   └── ProtectedRoute.tsx
│   ├── common/
│   │   ├── CustomPaletteEditor.tsx
│   │   ├── DateRangeFilter.tsx
│   │   └── StatusChip.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Layout.tsx
│   │   └── Sidebar.tsx
│   └── table/
│       └── AdvancedDataTable.tsx
├── context/
│   └── DateFormatContext.tsx    # Global date/timestamp formatting
├── contexts/
│   └── AuthContext.tsx           # JWT authentication state
├── pages/
│   ├── demo/
│   │   └── DemoProductsPage.tsx  # Demo products with backend integration
│   ├── Components.tsx
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   └── Settings.tsx
├── services/
│   └── api.ts                    # API client with axios
├── theme/
│   └── ThemeContext.tsx          # Dark mode & color palettes
├── types/
│   └── palette.ts
└── App.tsx                       # Main routing
```

## Important Design Decisions

### 1. Demo vs Real Code Separation

**Demo Package** (`com.template.business.demo`):
- Contains example entities, controllers, services for demonstration
- Uses table name `demo_products` (separate from real data)
- Can be **safely deleted** when starting real development
- Currently includes DemoProduct entity with full CRUD operations

**Real Business Packages**:
- `entity/`, `repository/`, `service/`, `controller/` are ready for real business logic
- Currently contains only User entity and authentication services
- Demo code does NOT pollute these packages

### 2. Date/Timestamp Formatting System

Located in: `frontend/src/context/DateFormatContext.tsx`

**Features**:
- Separate configuration for dates and timestamps
- User-configurable from Settings page
- Centralized formatting via React Context

**Formats Available**:
- Date: DD.MM.YYYY (default), MM/DD/YYYY, YYYY-MM-DD
- Timestamp: DD.MM.YYYY HH:mm:ss (default), MM/DD/YYYY HH:mm:ss, YYYY-MM-DD HH:mm:ss

**Usage**:
```typescript
const { formatDate, formatTimestamp } = useDateFormat();
formatDate(new Date());           // "07.12.2025"
formatTimestamp(new Date());      // "07.12.2025 14:30:45"
formatTimestamp('2025-12-07T...');// Accepts Date or ISO string
```

### 3. Authentication System

**JWT-based stateless authentication**:
- Login endpoint: `POST /auth/login`
- Returns JWT token
- Token stored in localStorage (frontend)
- JwtAuthenticationFilter validates token on each request
- Protected routes use ProtectedRoute component

**Test Users** (from DataInitializer):
- Admin: admin@example.com / admin123
- Manager: manager@example.com / manager123
- Users: john@example.com, jane@example.com, bob@example.com, alice@example.com (all password: password123)

### 4. Advanced Data Table Component

Located in: `frontend/src/components/table/AdvancedDataTable.tsx`

**Features**:
- Server-side pagination, filtering, sorting
- Inline editing with save/cancel
- Bulk editing (edit multiple rows, save all at once)
- Row selection
- Date range filtering
- Number, text, select filters
- Custom cell rendering
- Export to CSV/Excel

**Important for Performance**:
- When using AdvancedDataTable, always wrap columns in `useMemo`
- Wrap callback functions (onFetchData, onSave, onBulkSave) in `useCallback`
- Move helper functions outside component to prevent recreation

**Example** (see DemoProductsPage.tsx):
```typescript
const columns = useMemo(() => [
  { id: 'name', label: 'Name', filterType: 'text' as const, editable: true },
  // ...
], [formatTimestamp]); // Add dependencies if columns use them

const fetchData = useCallback(async (params: any) => {
  // fetch logic
}, []);
```

## Recent Fixes

### Fixed: Infinite Loop in DemoProductsPage
- **Issue**: Table was blinking/refreshing infinitely
- **Root Cause**: columns array and callbacks recreated on every render
- **Solution**: Used useMemo for columns, useCallback for functions
- **File**: `frontend/src/pages/demo/DemoProductsPage.tsx`

### Fixed: Duplicate Title
- **Issue**: "Product Management" text appeared on left side
- **Solution**: Removed extra Box wrapper, used only AdvancedDataTable's title prop

### Fixed: Date Format Not Using Settings
- **Issue**: Hardcoded dayjs formatting instead of user preference
- **Solution**: Integrated formatTimestamp from DateFormatContext

## API Endpoints

### Authentication
- POST `/auth/login` - Login with email/password
- POST `/auth/register` - Register new user

### Demo Products
- POST `/demo/products/search` - Search with filters/pagination
- GET `/demo/products/{id}` - Get product by ID
- POST `/demo/products` - Create new product
- PUT `/demo/products/{id}` - Update product
- PUT `/demo/products/bulk-update` - Bulk update products
- DELETE `/demo/products/{id}` - Delete product

## Running the Application

### Backend
```bash
# From project root
./mvnw spring-boot:run

# Or build and run
./mvnw clean package
java -jar target/business-app-backend-0.0.1-SNAPSHOT.jar
```

### Frontend (Development)
```bash
cd frontend
npm install
npm run dev
```

### Frontend (Build for Production)
```bash
cd frontend
npm run build
# Output goes to: src/main/resources/static/
```

### Access
- Backend API: http://localhost:8080
- Frontend Dev: http://localhost:5173
- H2 Console: http://localhost:8080/h2-console
  - JDBC URL: jdbc:h2:mem:businessappdb
  - Username: sa
  - Password: (empty)

## Theme & Styling

### Color Palettes
Located in: `frontend/src/types/palette.ts`

**Predefined Palettes**:
- Ocean Blue (default)
- Sunset Orange
- Forest Green
- Royal Purple
- Cherry Red
- Midnight Dark

**Custom Palettes**:
- Users can create custom palettes from Settings page
- Stored in localStorage
- Can be deleted individually

### Dark Mode
- Toggle from Settings page
- Persisted in localStorage
- All components automatically adapt

## Git Configuration

`.gitignore` is configured to exclude:
- frontend/node_modules/
- frontend/dist/
- frontend/.vite/
- frontend/package-lock.json
- frontend/.env
- src/main/resources/static/ (frontend build output)
- Standard Java/Maven excludes (target/, .class files, etc.)

## Next Steps for Real Development

When ready to build real business features:

1. **Optional**: Delete demo package entirely
   ```bash
   rm -rf src/main/java/com/template/business/demo/
   # Remove demo route from frontend/src/App.tsx
   # Remove "Demo Products" from frontend/src/components/layout/Sidebar.tsx
   ```

2. **Create real entities** in `entity/` package
   - Extend BaseEntity for automatic auditing (createdAt, updatedAt)

3. **Create repositories** in `repository/` package
   - Extend JpaRepository and JpaSpecificationExecutor for dynamic queries

4. **Create services** in `service/` package
   - Use SearchRequest pattern for filtering/pagination (see DemoProductService)

5. **Create controllers** in `controller/` package
   - Use ApiResponse wrapper for consistent responses
   - Use @PreAuthorize for role-based access control

6. **Create DTOs** in `dto/` package
   - Separate DTOs for requests/responses

7. **Create frontend pages** in `pages/` package
   - Use AdvancedDataTable for list views
   - Remember useMemo/useCallback for performance

## Common Patterns

### SearchRequest Pattern (Backend)
```java
@PostMapping("/search")
public ResponseEntity<ApiResponse<PageResponse<ProductDTO>>> search(@RequestBody SearchRequest request) {
    PageResponse<ProductDTO> response = productService.search(request);
    return ResponseEntity.ok(ApiResponse.success(response));
}
```

### Service with Specifications (Backend)
```java
public PageResponse<ProductDTO> search(SearchRequest request) {
    Specification<Product> spec = SpecificationBuilder.buildSpecification(
        request.getFilters(),
        request.getDateRanges()
    );

    Pageable pageable = PageRequest.of(
        request.getPage(),
        request.getPageSize(),
        Sort.by(request.getSort().getDirection(), request.getSort().getField())
    );

    Page<Product> page = repository.findAll(spec, pageable);
    // Convert to DTO and return PageResponse
}
```

### API Client Pattern (Frontend)
```typescript
export const myEntityAPI = {
  search: async (searchRequest: SearchRequest): Promise<ApiResponse<PageResponse<MyEntity>>> => {
    const response = await apiClient.post<ApiResponse<PageResponse<MyEntity>>>('/my-entities/search', searchRequest);
    return response.data;
  },
  // ... other CRUD methods
};
```

### Table Page Pattern (Frontend)
```typescript
const MyEntityPage = () => {
  const [data, setData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const { formatTimestamp } = useDateFormat();

  const columns = useMemo(() => [...], [formatTimestamp]);

  const fetchData = useCallback(async (params: any) => {
    // Convert to SearchRequest and call API
  }, []);

  return (
    <AdvancedDataTable
      columns={columns}
      data={data}
      totalRecords={totalRecords}
      loading={loading}
      onFetchData={fetchData}
      // ... other props
    />
  );
};
```

## Known Issues / Technical Debt

1. **Build Size**: Frontend bundle is 1.27 MB (384 KB gzipped) - could be optimized with code splitting
2. **H2 Database**: Using in-memory H2 - need to switch to PostgreSQL/MySQL for production
3. **Error Handling**: Could add global error boundary in React
4. **Loading States**: Could add skeleton loaders for better UX
5. **Validation**: Frontend validation could be more comprehensive

## Important Notes

- **Always use useMemo/useCallback** when passing arrays/functions to AdvancedDataTable
- **Always extend BaseEntity** for new entities to get automatic createdAt/updatedAt
- **Always use formatTimestamp** from DateFormatContext for displaying timestamps
- **Demo package is separate** - safe to delete when ready for production
- **JWT tokens expire** - currently set to 24 hours (configurable in application.properties)

## Last Session Summary

Completed timestamp formatting system:
- Added TimestampFormatType to DateFormatContext
- Implemented formatTimestamp function
- Updated Settings page with timestamp format selector
- Integrated throughout DemoProductsPage
- Default format: DD.MM.YYYY HH:mm:ss
- All features tested and working

---

**Last Updated**: 2025-12-07
**Session**: Completed timestamp formatting implementation
