# Business Application Backend Template

A comprehensive Spring Boot 3.4.0 backend template with common features for business applications.

## 🚀 Quick Start - Generate New Project

This is a **template project** that you can use to generate new projects with custom names!

### Option 1: Bash Script (Linux/Mac)
```bash
./create-new-project.sh
```

### Option 2: Node.js Script (Cross-platform)
```bash
node create-project.js
```

**What it does:**
- Creates a new project with your custom name
- Updates all package names (Java + frontend)
- Configures Maven and npm
- Renames database and application
- Creates project-specific README

**See [TEMPLATE_README.md](TEMPLATE_README.md) for detailed instructions.**

---

## Features

- ✅ **Spring Boot 3.4.0** - Latest Spring Boot version
- ✅ **Spring Security** - JWT-based authentication
- ✅ **Spring Data JPA** - Database access with Hibernate
- ✅ **H2 Database** - In-memory database (easily switchable to PostgreSQL/MySQL)
- ✅ **Lombok** - Reduce boilerplate code
- ✅ **MapStruct** - DTO mapping
- ✅ **SpringDoc OpenAPI** - Auto-generated API documentation (Swagger)
- ✅ **Global Exception Handling** - Centralized error handling
- ✅ **CORS Configuration** - Pre-configured for frontend integration
- ✅ **Base Entity** - Auditing fields (createdAt, updatedAt, createdBy, etc.)
- ✅ **Dynamic Search** - Specification-based filtering
- ✅ **Pagination & Sorting** - Built-in support
- ✅ **Bulk Operations** - Bulk update support
- ✅ **Sample Data** - Pre-loaded sample users and products

## Prerequisites

- Java 17 or higher
- Maven 3.6+

## Getting Started

### 1. Build the project

```bash
cd business-app-backend
mvn clean install
```

### 2. Run the application

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080/api`

### 3. Access H2 Console

Navigate to: `http://localhost:8080/api/h2-console`

- JDBC URL: `jdbc:h2:mem:businessdb`
- Username: `sa`
- Password: (leave empty)

### 4. Access API Documentation

Swagger UI: `http://localhost:8080/api/swagger-ui.html`

## Default Users

| Username | Password  | Roles       |
|----------|-----------|-------------|
| admin    | admin123  | ADMIN, USER |
| user     | user123   | USER        |

## Project Structure

```
src/main/java/com/template/business/
├── config/           # Configuration classes (CORS, Security)
├── controller/       # REST Controllers
├── dto/              # Data Transfer Objects
├── entity/           # JPA Entities
├── exception/        # Custom exceptions and global handler
├── repository/       # Spring Data JPA repositories
├── security/         # JWT utilities and filters
├── service/          # Business logic
└── util/             # Utility classes (SpecificationBuilder)
```

## API Endpoints

### Authentication

```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "type": "Bearer",
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "roles": ["ADMIN", "USER"]
  }
}
```

### Products

#### Search Products (with filtering, sorting, pagination)

```http
POST /api/products/search
Authorization: Bearer {token}
Content-Type: application/json

{
  "filters": {
    "name": "laptop",
    "category": "Electronics"
  },
  "dateRanges": {
    "createdAt": {
      "from": "2024-01-01",
      "to": "2024-12-31"
    }
  },
  "sort": {
    "column": "price",
    "order": "desc"
  },
  "page": 0,
  "pageSize": 10
}
```

#### Get Product by ID

```http
GET /api/products/{id}
Authorization: Bearer {token}
```

#### Create Product

```http
POST /api/products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Product",
  "description": "Product description",
  "price": 99.99,
  "quantity": 100,
  "category": "Electronics",
  "sku": "PRD-001"
}
```

#### Update Product

```http
PUT /api/products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Product",
  "price": 109.99,
  "quantity": 95
}
```

#### Bulk Update Products

```http
PUT /api/products/bulk-update
Authorization: Bearer {token}
Content-Type: application/json

{
  "products": [
    {
      "id": 1,
      "name": "Product 1",
      "price": 99.99,
      "quantity": 100
    },
    {
      "id": 2,
      "name": "Product 2",
      "price": 149.99,
      "quantity": 50
    }
  ]
}
```

#### Delete Product

```http
DELETE /api/products/{id}
Authorization: Bearer {token}
```

## Database Configuration

### H2 (Default - In-Memory)

```properties
spring.datasource.url=jdbc:h2:mem:businessdb
spring.datasource.driverClassName=org.h2.Driver
spring.datasource.username=sa
spring.datasource.password=
```

### PostgreSQL

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/businessdb
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
```

Add dependency:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

### MySQL

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/businessdb
spring.datasource.username=your_username
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

Add dependency:
```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

## Security Configuration

JWT configuration in `application.properties`:

```properties
jwt.secret=your-secret-key-change-this-in-production
jwt.expiration=86400000  # 24 hours
```

**Important**: Change the JWT secret in production!

## CORS Configuration

Configure allowed origins in `application.properties`:

```properties
cors.allowed-origins=http://localhost:5173,http://localhost:3000
cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS,PATCH
cors.allowed-headers=*
cors.allow-credentials=true
```

## Dynamic Search & Filtering

The application supports dynamic filtering using JPA Specifications. The `SpecificationBuilder` utility class automatically builds queries based on the search request.

### Supported Filter Types:

- **Text filters**: Case-insensitive partial matching
- **Number filters**: Exact matching
- **Date range filters**: From/To date filtering
- **Sorting**: By any column, ascending or descending
- **Pagination**: Page number and size

## Best Practices

1. **DTOs**: Always use DTOs for API requests/responses
2. **Validation**: Use Bean Validation (@NotBlank, @Email, etc.)
3. **Transactions**: Service methods are transactional
4. **Exception Handling**: Throw appropriate exceptions (ResourceNotFoundException)
5. **Logging**: Use SLF4J for logging
6. **Security**: Endpoints are secured by default (except /auth/*)

## Adding New Entities

1. Create entity class extending `BaseEntity`
2. Create repository interface extending `JpaRepository` and `JpaSpecificationExecutor`
3. Create DTO class
4. Create service class with business logic
5. Create controller with REST endpoints
6. Add sample data in `DataInitializer` (optional)

## Testing

Run tests:
```bash
mvn test
```

## Building for Production

```bash
mvn clean package
java -jar target/business-app-backend-1.0.0.jar
```

## Environment Variables

Set these in production:

```bash
export JWT_SECRET=your-production-secret-key
export SPRING_DATASOURCE_URL=jdbc:postgresql://your-db-host:5432/businessdb
export SPRING_DATASOURCE_USERNAME=your_username
export SPRING_DATASOURCE_PASSWORD=your_password
```

## License

This is a template project. Feel free to use and modify as needed.

## Support

For issues and questions, check the code documentation and Swagger UI.
