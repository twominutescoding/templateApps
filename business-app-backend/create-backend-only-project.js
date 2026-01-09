#!/usr/bin/env node

/**
 * Business App Backend-Only Template Generator (Node.js version)
 * Generates backend-only projects (no frontend) with external auth-service integration
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

function toKebabCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

function toCamelCase(str) {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());
}

function toPascalCase(str) {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

function toSnakeCase(str) {
  return str.toLowerCase().replace(/[-\s]/g, '_');
}

function copyDirSync(src, dest, exclude = []) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  fs.mkdirSync(dest, { recursive: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    // Skip excluded files/directories
    if (exclude.some(pattern => entry.name.match(pattern))) {
      continue;
    }

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath, exclude);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');

  for (const [search, replace] of Object.entries(replacements)) {
    content = content.replace(new RegExp(search, 'g'), replace);
  }

  fs.writeFileSync(filePath, content, 'utf8');
}

function replaceInAllFiles(dir, replacements, extensions = ['.java', '.properties', '.json', '.html', '.md', '.xml']) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (let entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      replaceInAllFiles(fullPath, replacements, extensions);
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      try {
        replaceInFile(fullPath, replacements);
      } catch (err) {
        console.warn(`Warning: Could not process ${fullPath}`);
      }
    }
  }
}

function removeFrontendPluginsFromPom(pomPath) {
  let content = fs.readFileSync(pomPath, 'utf8');

  // Remove frontend-maven-plugin
  const frontendPluginRegex = /<!-- Frontend Maven Plugin -->[\s\S]*?<plugin>[\s\S]*?<groupId>com\.github\.eirslett<\/groupId>[\s\S]*?<\/plugin>/;
  content = content.replace(frontendPluginRegex, '');

  // Remove maven-resources-plugin for frontend
  const resourcesPluginRegex = /<!-- Maven Resources Plugin - Copy frontend build to static folder -->[\s\S]*?<plugin>[\s\S]*?<artifactId>maven-resources-plugin<\/artifactId>[\s\S]*?<\/plugin>/;
  content = content.replace(resourcesPluginRegex, '');

  fs.writeFileSync(pomPath, content, 'utf8');
}

async function main() {
  console.log('==========================================');
  console.log('Backend-Only Business App Template Generator');
  console.log('==========================================\n');

  try {
    const projectName = await question('Enter project name (e.g., inventory-api): ');
    const basePackage = await question('Enter base package name (e.g., com.mycompany): ');
    const appDisplayName = await question('Enter application display name (e.g., Inventory API): ');
    const serverPort = await question('Enter server port (default: 8090): ') || '8090';
    const authServiceUrl = await question('Enter auth-service URL (default: http://localhost:8091/auth/api/v1/auth/login): ') || 'http://localhost:8091/auth/api/v1/auth/login';
    let targetDir = await question('Enter target directory (default: ../): ');

    targetDir = targetDir || '../';

    const projectNameKebab = toKebabCase(projectName);
    const projectNameSnake = toSnakeCase(projectName);
    const projectNamePascal = toPascalCase(projectName);

    // Extract auth-service base URL for refresh endpoint
    const authServiceBase = authServiceUrl.replace('/login', '');
    const authServiceRefreshUrl = `${authServiceBase}/refresh`;

    const newProjectDir = path.join(targetDir, projectNameKebab);
    const packagePath = basePackage.replace(/\./g, '/');

    console.log('\nSummary:');
    console.log('----------------------------------------');
    console.log(`Project Name: ${projectNameKebab}`);
    console.log(`Package: ${basePackage}.${projectNameSnake}`);
    console.log(`Display Name: ${appDisplayName}`);
    console.log(`Server Port: ${serverPort}`);
    console.log(`Auth Service Login URL: ${authServiceUrl}`);
    console.log(`Auth Service Refresh URL: ${authServiceRefreshUrl}`);
    console.log(`Target Directory: ${newProjectDir}`);
    console.log(`Type: Backend-Only (No Frontend)`);
    console.log('----------------------------------------\n');

    const confirm = await question('Proceed with generation? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Aborted.');
      rl.close();
      return;
    }

    console.log('\nCreating new backend-only project...');

    // Copy project structure (EXCLUDING frontend directory and static resources)
    console.log('Copying backend files only...');
    const sourceDir = __dirname;
    const exclude = [
      /^target$/,
      /^node_modules$/,
      /^dist$/,
      /^\.git$/,
      /\.log$/,
      /^\.env$/,
      /^frontend$/,                           // EXCLUDE frontend directory
      /^static$/,                             // EXCLUDE static directory
      /^create-new-project\.sh$/,
      /^create-project\.js$/,
      /^create-backend-only-project\.js$/,
      /^TEMPLATE_README\.md$/
    ];

    copyDirSync(sourceDir, newProjectDir, exclude);

    // Also delete static folder if it exists in resources
    const staticDir = path.join(newProjectDir, 'src/main/resources/static');
    if (fs.existsSync(staticDir)) {
      fs.rmSync(staticDir, { recursive: true, force: true });
    }

    // Restructure Java packages
    console.log('Restructuring Java packages...');
    const oldPackagePath = path.join(newProjectDir, 'src/main/java/com/template/business');
    const newPackagePath = path.join(newProjectDir, `src/main/java/${packagePath}/${projectNameSnake}`);

    if (fs.existsSync(oldPackagePath)) {
      fs.mkdirSync(newPackagePath, { recursive: true });
      copyDirSync(oldPackagePath, newPackagePath, []);
      fs.rmSync(path.join(newProjectDir, 'src/main/java/com'), { recursive: true, force: true });
    }

    // Prepare replacements
    const replacements = {
      'com\\.template\\.business': `${basePackage}.${projectNameSnake}`,
      'business-app-backend': projectNameKebab,
      'Business App Template': appDisplayName,
      'Business Application Backend Template': appDisplayName,
      'Business App': appDisplayName,
      'businessdb': `${projectNameSnake}db`,
      'server\\.port=8090': `server.port=${serverPort}`,
      'AUTH_SERVICE_URL:http://localhost:8091/auth/api/v1/auth/login': `AUTH_SERVICE_URL:${authServiceUrl}`,
      'AUTH_SERVICE_REFRESH_URL:http://localhost:8091/auth/api/v1/auth/refresh': `AUTH_SERVICE_REFRESH_URL:${authServiceRefreshUrl}`,
      // Update CORS origins - remove React dev server defaults for backend-only
      'cors\\.allowed-origins=\\$\\{CORS_ORIGINS:http://localhost:5173,http://localhost:3000\\}': 'cors.allowed-origins=${CORS_ORIGINS:http://localhost:3000}',
      '<groupId>com\\.template</groupId>': `<groupId>${basePackage}</groupId>`,
      '<artifactId>business-app-backend</artifactId>': `<artifactId>${projectNameKebab}</artifactId>`,
      '<name>business-app-backend</name>': `<name>${projectNameKebab}</name>`,
      'logging\\.level\\.com\\.template\\.business': `logging.level.${basePackage}.${projectNameSnake}`,
    };

    // Replace in all files
    console.log('Updating configuration files...');
    replaceInAllFiles(newProjectDir, replacements);

    // Remove frontend plugins from pom.xml
    console.log('Removing frontend Maven plugins from pom.xml...');
    const pomPath = path.join(newProjectDir, 'pom.xml');
    removeFrontendPluginsFromPom(pomPath);

    // Create new README
    console.log('Creating README...');
    const readme = `# ${appDisplayName}

This backend-only project was generated from the Business App Backend Template.

## Architecture

This is a **backend-only API** application with:
- **Spring Boot 4.0.1** (Java 17)
- **External auth-service** for authentication
- **RESTful API** endpoints
- **Swagger UI** for API documentation
- **No frontend** - Use any frontend framework or mobile app

### Authentication

All user authentication is handled by a separate auth-service microservice:
- JWT tokens issued by auth-service
- Refresh tokens managed by auth-service (7-day expiration)
- Roles embedded in JWT tokens for authorization
- No local user database

## Prerequisites

1. **Auth Service must be running first!**
   - Clone and start auth-service on port 8091
   - See: https://github.com/your-org/auth-service

2. Java 17 or higher
3. Maven 3.6+

## Quick Start

### 1. Start Auth Service (Required!)
\`\`\`bash
# In a separate terminal
cd ../auth-service
./mvnw spring-boot:run
# Wait for: "Started AuthServiceApplication on port 8091"
\`\`\`

### 2. Start Backend API
\`\`\`bash
./mvnw spring-boot:run
# Starts on port ${serverPort}
\`\`\`

## Access

- **API Base URL**: http://localhost:${serverPort}/api
- **Swagger UI**: http://localhost:${serverPort}/api/swagger-ui.html
- **H2 Console**: http://localhost:${serverPort}/api/h2-console
  - JDBC URL: \`jdbc:h2:mem:${projectNameSnake}db\`
  - Username: \`sa\`
  - Password: (empty)

## Authentication

### Login Credentials (from auth-service)

- **Admin**: \`admin\` / \`password\`
- **User**: \`user1\` / \`password\`
- **Manager**: \`user2\` / \`password\`

Users are managed in the auth-service database.

### Auth Service Integration

This API is configured to use auth-service at:
- **Login**: ${authServiceUrl}
- **Refresh**: ${authServiceRefreshUrl}

To change this, update \`application.properties\`:
\`\`\`properties
auth.service.url=\${AUTH_SERVICE_URL:${authServiceUrl}}
auth.service.refresh-url=\${AUTH_SERVICE_REFRESH_URL:${authServiceRefreshUrl}}
\`\`\`

### Using the API

#### 1. Login to get JWT token
\`\`\`bash
curl -X POST http://localhost:${serverPort}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"password"}'
\`\`\`

Response:
\`\`\`json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "type": "Bearer",
    "username": "admin",
    "email": "admin@example.com",
    "roles": ["ADMIN"]
  }
}
\`\`\`

#### 2. Use token in API requests
\`\`\`bash
curl -X GET http://localhost:${serverPort}/api/demo/products/1 \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
\`\`\`

#### 3. Refresh expired token
\`\`\`bash
curl -X POST http://localhost:${serverPort}/api/auth/refresh \\
  -H "Content-Type: application/json" \\
  -d '{"refreshToken":"YOUR_REFRESH_TOKEN"}'
\`\`\`

## Configuration

### JWT Secret (Important!)

The \`jwt.secret\` in this app **must match** the auth-service secret, otherwise token validation will fail.

In \`application.properties\`:
\`\`\`properties
jwt.secret=\${JWT_SECRET:your-secret-key}
\`\`\`

Generate a secure secret:
\`\`\`bash
openssl rand -base64 64
\`\`\`

Set it in **both** applications (auth-service and this app):
\`\`\`bash
export JWT_SECRET=your-generated-secret
\`\`\`

### Database (Production)

Switch to Oracle in production by setting:
\`\`\`bash
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=your-db-host
export DB_PORT=1521
export DB_SID=YOUR_SID
export DB_USERNAME=your_user
export DB_PASSWORD=your_password
\`\`\`

## API Endpoints

### Authentication (Proxied to auth-service)

- \`POST /api/auth/login\` - Login with username/password
- \`POST /api/auth/refresh\` - Refresh expired access token

### Demo Products (Example CRUD)

- \`POST /api/demo/products/search\` - Search with filters/pagination
- \`GET /api/demo/products/{id}\` - Get by ID
- \`POST /api/demo/products\` - Create
- \`PUT /api/demo/products/{id}\` - Update
- \`PUT /api/demo/products/bulk-update\` - Bulk update
- \`DELETE /api/demo/products/{id}\` - Delete

See **Swagger UI** for complete API documentation.

## Building for Production

\`\`\`bash
./mvnw clean package
java -jar target/${projectNameKebab}-1.0.0.jar
\`\`\`

## Troubleshooting

### "Authentication service unavailable"
- **Cause**: Auth-service is not running
- **Solution**: Start auth-service first on port 8091

### "Invalid token" errors
- **Cause**: JWT_SECRET mismatch between services
- **Solution**: Ensure both use the same JWT_SECRET

### "User not found"
- **Cause**: Users exist in auth-service, not this app
- **Solution**: Login with credentials from auth-service

## Documentation

Detailed documentation is available in the [\`docs/\`](docs/) folder:

- **[Exception Handling](docs/EXCEPTION_HANDLING.md)** - Error handling guide
- **[Exception Migration Guide](docs/EXCEPTION_MIGRATION_GUIDE.md)** - Migrating exceptions
- **[External Auth Refactoring](docs/EXTERNAL_AUTH_REFACTORING.md)** - Auth architecture

## Adding New Entities

When adding real business entities:

1. **Create entity** in \`entity/\` extending \`BaseEntity\` (provides createdAt, updatedAt, createdBy, modifiedBy)
2. **Create repository** in \`repository/\` extending \`JpaRepository\` and \`JpaSpecificationExecutor\`
3. **Create DTOs** in \`dto/\` for request/response
4. **Create service** in \`service/\` using \`SearchRequest\` pattern
5. **Create controller** in \`controller/\` with \`@PreAuthorize\` for role-based access

## Demo Code

The \`demo/\` package contains example code that can be safely deleted:
- \`${basePackage}.${projectNameSnake}.demo\` - Demo products CRUD

To delete:
\`\`\`bash
rm -rf src/main/java/${packagePath}/${projectNameSnake}/demo/
\`\`\`

## Environment Variables

Set these in production:

\`\`\`bash
# Auth Service URLs
export AUTH_SERVICE_URL=https://your-auth-service/api/v1/auth/login
export AUTH_SERVICE_REFRESH_URL=https://your-auth-service/api/v1/auth/refresh

# JWT Secret (MUST match auth-service!)
export JWT_SECRET=your-production-secret-key

# Database (Oracle for production)
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=your-db-host
export DB_PORT=1521
export DB_SID=YOUR_SID
export DB_USERNAME=your_user
export DB_PASSWORD=your_password
\`\`\`

## Integrating with Frontend

This backend-only API can be consumed by:
- **React** - Use axios or fetch
- **Angular** - Use HttpClient
- **Vue** - Use axios or fetch
- **Mobile Apps** - iOS, Android, React Native
- **Desktop Apps** - Electron, etc.

### CORS Configuration

Configure allowed origins in \`application.properties\` to match your frontend URLs:
\`\`\`properties
# Add your frontend URLs (React, Angular, Vue, mobile app, etc.)
cors.allowed-origins=http://localhost:3000,https://your-frontend.com
\`\`\`

Common frontend dev server ports:
- React (Create React App): http://localhost:3000
- Vite (React/Vue): http://localhost:5173
- Angular: http://localhost:4200
- Vue CLI: http://localhost:8080

## Support

For issues and questions, check:
- Code documentation in \`docs/\` folder
- Swagger UI for API documentation

---

Generated from Business App Backend-Only Template
Package: ${basePackage}.${projectNameSnake}
Auth Service: ${authServiceUrl}
`;

    fs.writeFileSync(path.join(newProjectDir, 'README.md'), readme, 'utf8');

    console.log('\n==========================================');
    console.log('✅ Backend-only project created successfully!');
    console.log('==========================================\n');
    console.log('Next steps:');
    console.log('\n1. Start auth-service (REQUIRED):');
    console.log('   cd ../auth-service');
    console.log('   ./mvnw spring-boot:run');
    console.log(`\n2. Start your backend API (${projectNameKebab}):`);<
    console.log(`   cd ${newProjectDir}`);
    console.log('   ./mvnw spring-boot:run');
    console.log(`\n3. Access Swagger UI:`);
    console.log(`   http://localhost:${serverPort}/api/swagger-ui.html`);
    console.log('\n4. Test API with curl:');
    console.log(`   curl -X POST http://localhost:${serverPort}/api/auth/login \\`);
    console.log('     -H "Content-Type: application/json" \\');
    console.log('     -d \'{"username":"admin","password":"password"}\'');
    console.log('\nIMPORTANT: Set matching JWT_SECRET in both services!');
    console.log(`\nYour new backend API is ready at: ${newProjectDir}\n`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    rl.close();
  }
}

main();
