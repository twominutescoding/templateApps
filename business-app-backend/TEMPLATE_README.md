# Business App Template - Project Generator

This is a template for creating enterprise-grade business applications with Spring Boot and React.

## Features

### Backend (Spring Boot 3.4.0)
- ✅ JWT Authentication
- ✅ RESTful API with pagination, filtering, sorting
- ✅ JPA Specifications for dynamic queries
- ✅ H2 in-memory database (easily switchable to PostgreSQL/MySQL)
- ✅ Separate demo package (safe to delete)
- ✅ Base entity with audit fields (createdAt, updatedAt)

### Frontend (React 19 + TypeScript)
- ✅ Material-UI v7 components
- ✅ Advanced data table with:
  - Server-side pagination, filtering, sorting
  - Inline and bulk editing
  - Row selection with export to CSV/JSON
  - Master-detail pattern (row click callbacks)
  - Manual/auto filter triggers
  - Column width configuration
  - Numeric input without spinners
- ✅ Dark mode with custom color palettes
- ✅ Date/timestamp formatting (user-configurable)
- ✅ Protected routes
- ✅ Responsive design

## Quick Start - Generate New Project

### Method 1: Interactive Script (Recommended)

```bash
cd /path/to/business-app-backend
./create-new-project.sh
```

The script will ask you:
- **Project name**: `inventory-management` (kebab-case)
- **Base package**: `com.mycompany`
- **Display name**: `Inventory Management System`
- **Target directory**: `../` (where to create the new project)

Example:
```bash
./create-new-project.sh

# Input:
# Project name: inventory-management
# Base package: com.acme
# Display name: Acme Inventory System
# Target directory: ../

# Output:
# ../inventory-management/
```

### Method 2: Manual Copy

```bash
# Copy the template
cp -r business-app-backend my-new-project
cd my-new-project

# Then manually update:
# - pom.xml (groupId, artifactId, name)
# - Java package names
# - application.properties
# - frontend/package.json
# - frontend/index.html
```

## What Gets Customized

The generator script updates:

### Backend
- ✅ Maven `groupId`, `artifactId`, `name` in `pom.xml`
- ✅ Java package structure: `com.template.business` → `your.package.name`
- ✅ Package declarations in all Java files
- ✅ Import statements in all Java files
- ✅ `spring.application.name` in `application.properties`
- ✅ Database name in H2 URL

### Frontend
- ✅ Package name in `package.json`
- ✅ Application title in `index.html`
- ✅ Display name throughout the app

### Documentation
- ✅ README.md with project-specific instructions
- ✅ claude.md with updated names

## Generated Project Structure

```
my-new-project/
├── src/main/java/
│   └── your/package/name/
│       ├── config/          # Security, JWT, CORS
│       ├── controller/      # REST controllers
│       ├── demo/           # Demo code (deletable)
│       ├── dto/            # Data Transfer Objects
│       ├── entity/         # JPA entities
│       ├── repository/     # Spring Data repositories
│       ├── service/        # Business logic
│       └── util/           # Utilities
├── src/main/resources/
│   ├── application.properties
│   └── static/            # Frontend build output
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API clients
│   │   ├── theme/        # MUI theme
│   │   └── types/        # TypeScript types
│   ├── package.json
│   └── vite.config.ts
├── pom.xml
└── README.md
```

## After Generation

### 1. Start the backend
```bash
cd my-new-project
./mvnw spring-boot:run
```

### 2. Install and start frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Access the application
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- H2 Console: http://localhost:8080/h2-console

### 4. Default credentials
- Admin: `admin@example.com` / `admin123`
- Manager: `manager@example.com` / `manager123`
- User: `john@example.com` / `password123`

## Customization After Generation

### Remove Demo Code
```bash
rm -rf src/main/java/your/package/demo/
# Remove demo routes from frontend/src/App.tsx
# Remove "Demo Products" from frontend/src/components/layout/Sidebar.tsx
```

### Add Your Entities

1. **Create entity** extending `BaseEntity`:
```java
@Entity
@Table(name = "your_entities")
public class YourEntity extends BaseEntity {
    // Your fields
}
```

2. **Create repository**:
```java
public interface YourRepository extends JpaRepository<YourEntity, Long>,
                                         JpaSpecificationExecutor<YourEntity> {
}
```

3. **Create service** using `SearchRequest` pattern
4. **Create controller** with REST endpoints
5. **Create frontend page** using `AdvancedDataTable`

### Switch Database to PostgreSQL

Update `pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

Update `application.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/yourdb
spring.datasource.username=postgres
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
```

## Template Maintenance

To update the template itself:
1. Make changes to the original `business-app-backend` project
2. Test thoroughly
3. Update version/date in `TEMPLATE_README.md`
4. Commit changes to your template repository

## Advanced Features

### Using AdvancedDataTable

```typescript
<AdvancedDataTable
  title="My Entities"
  columns={columns}
  data={data}
  totalRecords={totalRecords}
  loading={loading}
  rowIdField="id"
  onFetchData={fetchData}
  filterTrigger="manual"        // or "auto"
  enableBulkEdit={true}
  onBulkSave={handleBulkSave}
  onSave={handleSave}
  onRowClick={handleRowClick}   // Master-detail
/>
```

### Column Configuration

```typescript
const columns = useMemo(() => [
  {
    id: 'id',
    label: 'ID',
    filterType: 'number',
    editable: false,
    width: 80,              // Fixed width
  },
  {
    id: 'name',
    label: 'Name',
    filterType: 'text',
    editable: true,
    editType: 'text',
    minWidth: 150,          // Minimum width
  },
  {
    id: 'status',
    label: 'Status',
    filterType: 'select',
    filterOptions: [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Inactive', value: 'INACTIVE' },
    ],
    render: (row) => <StatusChip status={row.status} />,
  },
], []);
```

## Support

For issues or questions about this template:
1. Check `claude.md` for detailed documentation
2. Review the demo implementation in `src/demo/`
3. Refer to Spring Boot and React documentation

## Version History

- **v1.0.0** (2025-12-07): Initial template with all core features

---

**Template Repository**: Save this as a Git repository for easy distribution
**License**: Customize based on your needs
**Author**: Your Organization
