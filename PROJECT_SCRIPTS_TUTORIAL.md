# Project Generator Scripts Tutorial

This guide explains how to use the project generator scripts in this monorepo to create new applications.

## Available Scripts

| Script | Location | Purpose |
|--------|----------|---------|
| `create-auth-project.js` | `auth-service/` | Create a new authentication microservice |
| `create-project.js` | `business-app-backend/` | Create a full-stack business app (backend + frontend) |
| `create-backend-only-project.js` | `business-app-backend/` | Create a backend-only API (no frontend) |

## Prerequisites

- **Node.js 18+** installed
- **Java 17+** installed
- **Maven 3.6+** installed

## 1. Creating a New Auth Service

Use this script to create a standalone authentication microservice with LDAP support, JWT tokens, and admin frontend.

### Run the Script

```bash
cd auth-service
node create-auth-project.js
```

### Interactive Prompts

```
==========================================
Auth Service Template Generator
==========================================

Enter service name (e.g., user-auth-service): my-auth-service
Enter base package name (e.g., com.mycompany): com.acme
Enter display name (e.g., User Authentication Service): ACME Authentication
Enter server port (default: 8091): 8092
Enter context path (default: /auth): /auth
Enter target directory (default: ../): ../

Summary:
----------------------------------------
Service Name: my-auth-service
Package: com.acme.my_auth_service
Display Name: ACME Authentication
Server Port: 8092
Context Path: /auth
Target Directory: ../my-auth-service
----------------------------------------

Proceed with generation? (y/n): y
```

### What Gets Created

```
my-auth-service/
├── src/main/java/com/acme/my_auth_service/
│   ├── config/
│   ├── controller/
│   ├── dto/
│   ├── entity/
│   ├── exception/
│   ├── repository/
│   └── service/
├── src/main/resources/
│   ├── application.properties
│   └── data.sql
├── admin-frontend/          # React admin panel
│   ├── src/
│   └── package.json
├── pom.xml
└── README.md
```

### Next Steps After Creation

```bash
cd ../my-auth-service

# 1. Generate a secure JWT secret
openssl rand -base64 64

# 2. Set environment variables
export JWT_SECRET=your-generated-secret

# 3. Start the service
./mvnw spring-boot:run

# 4. (Optional) Start admin frontend
cd admin-frontend
npm install
npm run dev
```

---

## 2. Creating a Full-Stack Business App

Use this script to create a complete business application with Spring Boot backend and React frontend, integrated with external auth-service.

### Run the Script

```bash
cd business-app-backend
node create-project.js
```

### Interactive Prompts

```
==========================================
Business App Template Generator
==========================================

Enter project name (e.g., inventory-management): order-system
Enter base package name (e.g., com.mycompany): com.acme
Enter application display name (e.g., Inventory Management): Order Management System
Enter server port (default: 8090): 8080
Enter auth-service URL (default: http://localhost:8091/auth/api/v1/auth/login): http://localhost:8091/auth/api/v1/auth/login
Enter target directory (default: ../): ../

Summary:
----------------------------------------
Project Name: order-system
Package: com.acme.order_system
Display Name: Order Management System
Server Port: 8080
Auth Service Login URL: http://localhost:8091/auth/api/v1/auth/login
Auth Service Refresh URL: http://localhost:8091/auth/api/v1/auth/refresh
Target Directory: ../order-system
----------------------------------------

Proceed with generation? (y/n): y
```

### What Gets Created

```
order-system/
├── src/main/java/com/acme/order_system/
│   ├── config/
│   ├── controller/
│   ├── demo/                # Demo code (safe to delete)
│   ├── dto/
│   ├── entity/
│   ├── exception/
│   ├── repository/
│   └── service/
├── src/main/resources/
│   ├── application.properties
│   └── static/              # Frontend build output
├── frontend/                # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── pages/
│   │   ├── services/
│   │   └── theme/
│   └── package.json
├── docs/
├── pom.xml
└── README.md
```

### Next Steps After Creation

```bash
# 1. IMPORTANT: Start auth-service first!
cd ../auth-service
./mvnw spring-boot:run
# Wait for startup...

# 2. Start your new backend
cd ../order-system
./mvnw spring-boot:run

# 3. Start frontend development server
cd frontend
npm install
npm run dev

# 4. Open browser
# http://localhost:5173
# Login: admin / password
```

---

## 3. Creating a Backend-Only API

Use this script when you only need a REST API without the React frontend (e.g., for mobile apps or separate frontend projects).

### Run the Script

```bash
cd business-app-backend
node create-backend-only-project.js
```

### Interactive Prompts

```
==========================================
Backend-Only Business App Template Generator
==========================================

Enter project name (e.g., inventory-api): order-api
Enter base package name (e.g., com.mycompany): com.acme
Enter application display name (e.g., Inventory API): Order API
Enter server port (default: 8090): 8080
Enter auth-service URL (default: http://localhost:8091/auth/api/v1/auth/login): http://localhost:8091/auth/api/v1/auth/login
Enter target directory (default: ../): ../

Summary:
----------------------------------------
Project Name: order-api
Package: com.acme.order_api
Display Name: Order API
Server Port: 8080
Auth Service Login URL: http://localhost:8091/auth/api/v1/auth/login
Auth Service Refresh URL: http://localhost:8091/auth/api/v1/auth/refresh
Target Directory: ../order-api
Type: Backend-Only (No Frontend)
----------------------------------------

Proceed with generation? (y/n): y
```

### What Gets Created

```
order-api/
├── src/main/java/com/acme/order_api/
│   ├── config/
│   ├── controller/
│   ├── demo/                # Demo code (safe to delete)
│   ├── dto/
│   ├── entity/
│   ├── exception/
│   ├── repository/
│   └── service/
├── src/main/resources/
│   └── application.properties
├── docs/
├── pom.xml
└── README.md
```

**Note**: No `frontend/` directory or frontend Maven plugins.

### Next Steps After Creation

```bash
# 1. IMPORTANT: Start auth-service first!
cd ../auth-service
./mvnw spring-boot:run

# 2. Start your API
cd ../order-api
./mvnw spring-boot:run

# 3. Test with curl
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"password"}'

# 4. Access Swagger UI
# http://localhost:8080/api/swagger-ui.html
```

---

## Common Configuration

### JWT Secret (Critical!)

All services that share authentication **must use the same JWT secret**.

```bash
# Generate a secure secret
openssl rand -base64 64

# Set in all services
export JWT_SECRET=your-generated-secret-here
```

### Database Configuration

**Development** (no external DB needed — uses in-memory database by default):
```properties
# Default - no configuration needed
```

**Production** (Oracle or PostgreSQL):

Environment variables are prefixed with the entity code (e.g., `MY_APP_`). See `ENVIRONMENT_VARIABLES.md` for the full list.

```bash
# Replace MY_APP_ with your generated project's prefix (shown in generated README)
export MY_APP_DB_URL=jdbc:oracle:thin:@//your-db-host:1521/YOUR_SID
export MY_APP_DB_USERNAME=your_user
export MY_APP_DB_PASSWORD=your_password
export MY_APP_JWT_SECRET=your_64_byte_secret
```

### LDAP Configuration (Auth Service Only)

```bash
# Replace MY_APP_ with your auth service's prefix
export MY_APP_LDAP_ENABLED=true
export MY_APP_LDAP_URL=ldaps://your-ldap-server:636
export MY_APP_LDAP_BASE=your.domain.local
```

---

## Typical Development Workflow

### Starting Fresh Development Environment

```bash
# Terminal 1: Start auth-service
cd auth-service
./mvnw spring-boot:run

# Terminal 2: Start your business app backend
cd your-app
./mvnw spring-boot:run

# Terminal 3: Start frontend (if full-stack)
cd your-app/frontend
npm run dev
```

### Default Ports

| Service | Port | URL |
|---------|------|-----|
| Auth Service | 8091 | http://localhost:8091/auth |
| Auth Admin Frontend | 5174 | http://localhost:5174 |
| Business App Backend | 8090 | http://localhost:8090/api |
| Business App Frontend | 5173 | http://localhost:5173 |

### Test Credentials (from auth-service)

| Username | Password | Roles |
|----------|----------|-------|
| admin | password | ADMIN |
| user1 | password | USER, MANAGER |
| user2 | password | USER |

---

## Troubleshooting

### Script fails with "ENOENT" error
- Ensure you're running the script from the correct directory
- Check that Node.js is installed: `node --version`

### "Cannot find module" error
- The scripts use only built-in Node.js modules, no `npm install` needed
- Ensure Node.js version 18 or higher

### Generated project won't compile
- Verify Java 17+ is installed: `java --version`
- Run `./mvnw clean` then try again

### Authentication fails between services
- Ensure JWT_SECRET is the same in all services
- Start auth-service before other services
- Check auth-service is running on expected port

### Frontend can't connect to backend
- Check CORS configuration in `application.properties`
- Verify backend is running and accessible
- Check browser console for specific errors

---

## Deleting Demo Code

After creating a project, you can safely delete the demo code:

```bash
# Backend demo package
rm -rf src/main/java/com/yourpackage/demo/

# Frontend demo page (full-stack only)
rm -rf frontend/src/pages/demo/
# Also remove demo route from frontend/src/App.tsx
# Also remove "Demo Products" from frontend/src/components/layout/Sidebar.tsx
```

---

## Script Maintenance

The scripts automatically exclude:
- `target/` - Maven build output
- `node_modules/` - npm dependencies
- `dist/` - Frontend build output
- `.vite/` - Vite cache
- `.git/` - Git repository
- `.env` - Environment files
- `*.log` - Log files
- Other generator scripts

If you modify the template projects, the scripts will include your changes in newly generated projects.

---

## Quick Reference

```bash
# Create new auth service
cd auth-service && node create-auth-project.js

# Create full-stack business app
cd business-app-backend && node create-project.js

# Create backend-only API
cd business-app-backend && node create-backend-only-project.js
```
