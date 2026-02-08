#!/usr/bin/env node

/**
 * Business App Template Generator
 * Creates a new business application with external auth-service integration
 * Supports both full-stack (with React frontend) and backend-only projects
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const crypto = require('crypto');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// ============================================================================
// Helper Functions
// ============================================================================

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

function toUpperSnakeCase(str) {
  return toSnakeCase(str).toUpperCase();
}

function generateJwtSecret() {
  return crypto.randomBytes(32).toString('hex');
}

function copyDirSync(src, dest, exclude = []) {
  const entries = fs.readdirSync(src, { withFileTypes: true });

  fs.mkdirSync(dest, { recursive: true });

  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

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

function replaceInAllFiles(dir, replacements, extensions = ['.java', '.properties', '.json', '.html', '.md', '.xml', '.lock', '.ts', '.tsx', '.js', '.jsx']) {
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

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  console.log('==========================================');
  console.log('Business App Template Generator');
  console.log('==========================================\n');

  try {
    // ========================================================================
    // User Input - Application Type
    // ========================================================================
    console.log('--- Application Type ---\n');
    console.log('  1) Full-Stack Web App (Spring Boot + React Frontend)');
    console.log('  2) Backend Only (API without frontend)\n');

    let appTypeInput = await question('Select application type (1 or 2, default: 1): ') || '1';
    const isFullStack = appTypeInput.trim() === '1';
    const appTypeLabel = isFullStack ? 'Full-Stack Web App' : 'Backend Only';

    console.log(`\n  Selected: ${appTypeLabel}\n`);

    // ========================================================================
    // User Input - Basic Configuration
    // ========================================================================
    console.log('--- Basic Configuration ---\n');

    const projectName = await question('Enter project name (e.g., inventory-management): ');
    const basePackage = await question('Enter base package name (e.g., com.mycompany): ');
    const displayName = await question('Enter display name (e.g., Inventory Management): ');

    // ========================================================================
    // User Input - Server Configuration
    // ========================================================================
    console.log('\n--- Server Configuration ---\n');

    const serverPort = await question('Enter server port (default: 8090): ') || '8090';
    const contextPath = await question('Enter context path (default: /api): ') || '/api';

    // ========================================================================
    // User Input - Entity Configuration
    // ========================================================================
    console.log('\n--- Entity Configuration ---\n');

    const projectNameSnake = toSnakeCase(projectName);
    const defaultEntityCode = toUpperSnakeCase(projectName);
    const entityCode = await question(`Enter entity code (default: ${defaultEntityCode}): `) || defaultEntityCode;

    // ========================================================================
    // User Input - Database Configuration
    // ========================================================================
    console.log('\n--- Database Configuration ---\n');

    const defaultDbName = `${projectNameSnake}db`;
    const databaseName = await question(`Enter database name (default: ${defaultDbName}): `) || defaultDbName;

    // ========================================================================
    // User Input - Auth Service Configuration
    // ========================================================================
    console.log('\n--- Auth Service Configuration ---\n');

    const authServiceHost = await question('Enter auth-service host (default: localhost): ') || 'localhost';
    const authServicePort = await question('Enter auth-service port (default: 8091): ') || '8091';
    const authServiceContext = await question('Enter auth-service context path (default: /auth): ') || '/auth';

    // ========================================================================
    // User Input - Security Configuration
    // ========================================================================
    console.log('\n--- Security Configuration ---\n');

    const generateSecret = await question('Generate new JWT secret? (y/n, default: y): ') || 'y';
    const jwtSecret = generateSecret.toLowerCase() === 'y' ? generateJwtSecret() : null;

    // ========================================================================
    // User Input - Target Directory
    // ========================================================================
    console.log('\n--- Output Configuration ---\n');

    let targetDir = await question('Enter target directory (default: ../): ') || '../';

    // ========================================================================
    // Derived Values
    // ========================================================================
    const projectNameKebab = toKebabCase(projectName);
    const projectNamePascal = toPascalCase(projectName);

    // Build auth-service URLs from components
    const authServiceBaseUrl = `http://${authServiceHost}:${authServicePort}${authServiceContext}`;
    const authServiceUrl = `${authServiceBaseUrl}/api/v1/auth/login`;
    const authServiceRefreshUrl = `${authServiceBaseUrl}/api/v1/auth/refresh`;
    const authServiceLogUrl = `${authServiceBaseUrl}/api/v1/logs`;

    const newProjectDir = path.join(targetDir, projectNameKebab);
    const packagePath = basePackage.replace(/\./g, '/');

    // Ensure contextPath ends with / for Vite base URL
    const viteBase = contextPath.endsWith('/') ? contextPath : `${contextPath}/`;

    // ========================================================================
    // Summary
    // ========================================================================
    console.log('\n==========================================');
    console.log('Summary');
    console.log('==========================================\n');
    console.log(`Application Type: ${appTypeLabel}`);
    console.log(`Project Name:     ${projectNameKebab}`);
    console.log(`Package:          ${basePackage}.${projectNameSnake}`);
    console.log(`Display Name:     ${displayName}`);
    console.log(`Server Port:      ${serverPort}`);
    console.log(`Context Path:     ${contextPath}`);
    console.log(`Entity Code:      ${entityCode}`);
    console.log(`Database Name:    ${databaseName}`);
    console.log(`Auth Service:     ${authServiceBaseUrl}`);
    console.log(`  - Login URL:    ${authServiceUrl}`);
    console.log(`  - Refresh URL:  ${authServiceRefreshUrl}`);
    console.log(`  - Log URL:      ${authServiceLogUrl}`);
    console.log(`JWT Secret:       ${jwtSecret ? '(generated)' : '(not changed)'}`);
    console.log(`Target Directory: ${newProjectDir}`);
    console.log('\n==========================================\n');

    const confirm = await question('Proceed with generation? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Aborted.');
      rl.close();
      return;
    }

    // ========================================================================
    // Project Generation
    // ========================================================================
    console.log('\nCreating new project...\n');

    const totalSteps = isFullStack ? 4 : 5;

    // Copy project structure
    console.log(`[1/${totalSteps}] Copying project files...`);
    const sourceDir = __dirname;

    // Base exclusions
    const exclude = [
      /^target$/,
      /^node_modules$/,
      /^dist$/,
      /^\.vite$/,
      /^\.git$/,
      /\.log$/,
      /^\.env$/,
      /^create-new-project\.sh$/,
      /^create-project\.js$/,
      /^create-backend-only-project\.js$/,
      /^TEMPLATE_README\.md$/
    ];

    // For backend-only, exclude frontend
    if (!isFullStack) {
      exclude.push(/^frontend$/);
      exclude.push(/^static$/);
    }

    copyDirSync(sourceDir, newProjectDir, exclude);

    // For backend-only, delete static folder if it exists
    if (!isFullStack) {
      const staticDir = path.join(newProjectDir, 'src/main/resources/static');
      if (fs.existsSync(staticDir)) {
        fs.rmSync(staticDir, { recursive: true, force: true });
      }
    }

    // Restructure Java packages
    console.log(`[2/${totalSteps}] Restructuring Java packages...`);
    const oldPackagePath = path.join(newProjectDir, 'src/main/java/com/template/business');
    const newPackagePath = path.join(newProjectDir, `src/main/java/${packagePath}/${projectNameSnake}`);

    if (fs.existsSync(oldPackagePath)) {
      fs.mkdirSync(newPackagePath, { recursive: true });
      copyDirSync(oldPackagePath, newPackagePath, []);
      fs.rmSync(path.join(newProjectDir, 'src/main/java/com'), { recursive: true, force: true });
    }

    // Prepare replacements
    console.log(`[3/${totalSteps}] Updating configuration files...`);

    const replacements = {
      // Package name
      'com\\.template\\.business': `${basePackage}.${projectNameSnake}`,

      // Project names
      'business-app-backend': projectNameKebab,
      'business-app-frontend': `${projectNameKebab}-frontend`,
      'business-app-template': projectNameKebab,

      // Display names
      'Business App Template': displayName,
      'Business Application Backend Template': displayName,
      'Business App': displayName,

      // Database
      'businessdb': databaseName,

      // Server configuration
      'server\\.port=8090': `server.port=${serverPort}`,
      'server\\.servlet\\.context-path=/api': `server.servlet.context-path=${contextPath}`,

      // Maven configuration
      '<finalName>api</finalName>': `<finalName>${contextPath.replace(/^\//, '')}</finalName>`,
      '<groupId>com\\.template</groupId>': `<groupId>${basePackage}</groupId>`,
      '<artifactId>business-app-backend</artifactId>': `<artifactId>${projectNameKebab}</artifactId>`,
      '<name>business-app-backend</name>': `<name>${projectNameKebab}</name>`,

      // Auth service URLs
      'AUTH_SERVICE_URL:http://localhost:8091/auth/api/v1/auth/login': `AUTH_SERVICE_URL:${authServiceUrl}`,
      'AUTH_SERVICE_REFRESH_URL:http://localhost:8091/auth/api/v1/auth/refresh': `AUTH_SERVICE_REFRESH_URL:${authServiceRefreshUrl}`,
      'AUTH_SERVICE_LOG_URL:http://localhost:8091/auth/api/v1/logs': `AUTH_SERVICE_LOG_URL:${authServiceLogUrl}`,

      // Logging
      'logging\\.level\\.com\\.template\\.business': `logging.level.${basePackage}.${projectNameSnake}`,

      // Entity code (for auth-service login and app logging)
      'BUSINESS_APP': entityCode,

      // App logging create-user
      'app\\.logging\\.create-user=\\$\\{APP_LOGGING_CREATE_USER:business-app-backend\\}': `app.logging.create-user=\${APP_LOGGING_CREATE_USER:${projectNameKebab}}`,
    };

    // Full-stack specific replacements
    if (isFullStack) {
      replacements["base: '/api/'"] = `base: '${viteBase}'`;
      replacements["VITE_API_BASE_URL \\|\\| '/api'"] = `VITE_API_BASE_URL || '${contextPath}'`;
    } else {
      // Backend-only: remove React dev server from CORS
      replacements['cors\\.allowed-origins=\\$\\{CORS_ORIGINS:http://localhost:5173,http://localhost:3000\\}'] =
        `cors.allowed-origins=\${CORS_ORIGINS:http://localhost:3000}`;
    }

    // Add JWT secret replacement if generated
    if (jwtSecret) {
      replacements['9ff7ff40e4641ffc5e1078ce57f682723c7371612ecc84a0e9c60e786f90cfb0'] = jwtSecret;
    }

    replaceInAllFiles(newProjectDir, replacements);

    // For backend-only, remove frontend plugins from pom.xml
    if (!isFullStack) {
      console.log(`[4/${totalSteps}] Removing frontend Maven plugins...`);
      const pomPath = path.join(newProjectDir, 'pom.xml');
      removeFrontendPluginsFromPom(pomPath);
    }

    // Create README
    console.log(`[${totalSteps}/${totalSteps}] Creating README...`);

    let readme;
    if (isFullStack) {
      readme = generateFullStackReadme({
        displayName, projectNameKebab, projectNameSnake, basePackage,
        serverPort, contextPath, entityCode, databaseName,
        authServiceBaseUrl, authServiceUrl, authServiceRefreshUrl, authServiceLogUrl,
        jwtSecret, packagePath
      });
    } else {
      readme = generateBackendOnlyReadme({
        displayName, projectNameKebab, projectNameSnake, basePackage,
        serverPort, contextPath, entityCode, databaseName,
        authServiceBaseUrl, authServiceUrl, authServiceRefreshUrl, authServiceLogUrl,
        jwtSecret, packagePath
      });
    }

    fs.writeFileSync(path.join(newProjectDir, 'README.md'), readme, 'utf8');

    // ========================================================================
    // Success Message
    // ========================================================================
    console.log('\n==========================================');
    console.log('Project created successfully!');
    console.log('==========================================\n');

    console.log('Next steps:\n');
    console.log('1. Start auth-service (REQUIRED):');
    console.log('   cd ../auth-service');
    console.log('   ./mvnw spring-boot:run\n');
    console.log(`2. Start backend (${projectNameKebab}):`);
    console.log(`   cd ${newProjectDir}`);
    console.log('   ./mvnw spring-boot:run\n');

    if (isFullStack) {
      console.log('3. Start frontend:');
      console.log('   cd frontend');
      console.log('   npm install');
      console.log('   npm run dev\n');
      console.log('4. Open http://localhost:5173\n');
      console.log('5. Login with: admin / password\n');
    } else {
      console.log(`3. Open Swagger UI:`);
      console.log(`   http://localhost:${serverPort}${contextPath}/swagger-ui.html\n`);
      console.log('4. Test API:');
      console.log(`   curl -X POST http://localhost:${serverPort}${contextPath}/auth/login \\`);
      console.log('     -H "Content-Type: application/json" \\');
      console.log(`     -d '{"username":"admin","password":"password","entityCode":"${entityCode}"}'`);
      console.log('');
    }

    if (jwtSecret) {
      console.log('JWT Secret (must match auth-service):');
      console.log(`${jwtSecret}\n`);
    }

    console.log(`Your new project is ready at: ${newProjectDir}\n`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    rl.close();
  }
}

// ============================================================================
// README Generators
// ============================================================================

function generateFullStackReadme(config) {
  const {
    displayName, projectNameKebab, projectNameSnake, basePackage,
    serverPort, contextPath, entityCode, databaseName,
    authServiceBaseUrl, authServiceUrl, authServiceRefreshUrl, authServiceLogUrl,
    jwtSecret
  } = config;

  return `# ${displayName}

This project was generated from the Business App Template.

## Architecture

This application uses **external auth-service** for authentication:
- All user authentication is handled by a separate auth-service microservice
- JWT tokens are issued by auth-service and validated locally
- Refresh tokens are managed by auth-service
- No local user database (users stored in auth-service)

## Project Structure

- **Backend**: Spring Boot 4.0.1 (Java 17)
- **Frontend**: React 19 with TypeScript and Vite
- **Database**: H2 (in-memory) for development, Oracle for production
- **Authentication**: External auth-service (JWT-based)
- **UI Library**: Material-UI (MUI) v7

## Prerequisites

1. **Auth Service must be running first!**
   - Start auth-service on ${authServiceBaseUrl}

2. Java 17 or higher
3. Node.js 18+ and npm
4. Maven 3.6+

## Quick Start

### 1. Start Auth Service (Required!)

\`\`\`bash
cd ../auth-service
./mvnw spring-boot:run
\`\`\`

### 2. Start Backend

\`\`\`bash
./mvnw spring-boot:run
# Starts on port ${serverPort}
\`\`\`

### 3. Start Frontend (Development)

\`\`\`bash
cd frontend
npm install
npm run dev
# Starts on port 5173
\`\`\`

## Access Points

- **Frontend**: http://localhost:5173 (dev) or http://localhost:${serverPort}${contextPath}/ (production)
- **Backend API**: http://localhost:${serverPort}${contextPath}
- **Swagger UI**: http://localhost:${serverPort}${contextPath}/swagger-ui.html
- **H2 Console**: http://localhost:${serverPort}${contextPath}/h2-console
  - JDBC URL: \`jdbc:h2:mem:${databaseName}\`
  - Username: \`sa\`
  - Password: (empty)

## Authentication

### Login Credentials (from auth-service)

- **Admin**: \`admin\` / \`password\`
- **User**: \`user1\` / \`password\`
- **Manager**: \`user2\` / \`password\`

### Auth Service Integration

This app is configured to use auth-service at:
- **Login**: ${authServiceUrl}
- **Refresh**: ${authServiceRefreshUrl}
- **Logging**: ${authServiceLogUrl}

## Configuration

### JWT Secret
${jwtSecret ? `
Your generated JWT secret:
\`\`\`
${jwtSecret}
\`\`\`

This secret is already configured. **Make sure auth-service uses the same secret!**
` : `
The \`jwt.secret\` in this app **must match** the auth-service secret.

Generate a secure secret:
\`\`\`bash
openssl rand -hex 32
\`\`\`
`}

### Database (Production)

\`\`\`bash
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=your-db-host
export DB_PORT=1521
export DB_SID=YOUR_SID
export DB_USERNAME=your_user
export DB_PASSWORD=your_password
\`\`\`

## Building for Production

### Backend + Frontend (Single JAR)

\`\`\`bash
cd frontend
npm install
npm run build

cd ..
./mvnw clean package
java -jar target/${projectNameKebab}-1.0.0.jar
\`\`\`

## Demo Code

The \`demo/\` package contains example code that can be safely deleted:
- \`${basePackage}.${projectNameSnake}.demo\` - Demo products CRUD
- \`frontend/src/pages/demo\` - Demo products page

---

Generated from Business App Template
- Package: \`${basePackage}.${projectNameSnake}\`
- Entity Code: \`${entityCode}\`
- Auth Service: ${authServiceBaseUrl}
`;
}

function generateBackendOnlyReadme(config) {
  const {
    displayName, projectNameKebab, projectNameSnake, basePackage,
    serverPort, contextPath, entityCode, databaseName,
    authServiceBaseUrl, authServiceUrl, authServiceRefreshUrl, authServiceLogUrl,
    jwtSecret, packagePath
  } = config;

  return `# ${displayName}

This backend-only API was generated from the Business App Template.

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
   - Start auth-service on ${authServiceBaseUrl}

2. Java 17 or higher
3. Maven 3.6+

## Quick Start

### 1. Start Auth Service (Required!)

\`\`\`bash
cd ../auth-service
./mvnw spring-boot:run
\`\`\`

### 2. Start Backend API

\`\`\`bash
./mvnw spring-boot:run
# Starts on port ${serverPort}
\`\`\`

## Access Points

- **API Base URL**: http://localhost:${serverPort}${contextPath}
- **Swagger UI**: http://localhost:${serverPort}${contextPath}/swagger-ui.html
- **H2 Console**: http://localhost:${serverPort}${contextPath}/h2-console
  - JDBC URL: \`jdbc:h2:mem:${databaseName}\`
  - Username: \`sa\`
  - Password: (empty)

## Authentication

### Login Credentials (from auth-service)

- **Admin**: \`admin\` / \`password\`
- **User**: \`user1\` / \`password\`
- **Manager**: \`user2\` / \`password\`

### Using the API

#### 1. Login to get JWT token

\`\`\`bash
curl -X POST http://localhost:${serverPort}${contextPath}/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"username":"admin","password":"password","entityCode":"${entityCode}"}'
\`\`\`

#### 2. Use token in API requests

\`\`\`bash
curl -X GET http://localhost:${serverPort}${contextPath}/demo/products/1 \\
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
\`\`\`

## Configuration

### JWT Secret
${jwtSecret ? `
Your generated JWT secret:
\`\`\`
${jwtSecret}
\`\`\`

This secret is already configured. **Make sure auth-service uses the same secret!**
` : `
The \`jwt.secret\` in this app **must match** the auth-service secret.

Generate a secure secret:
\`\`\`bash
openssl rand -hex 32
\`\`\`
`}

### Database (Production)

\`\`\`bash
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=your-db-host
export DB_PORT=1521
export DB_SID=YOUR_SID
export DB_USERNAME=your_user
export DB_PASSWORD=your_password
\`\`\`

### CORS Configuration

Configure allowed origins for your frontend:

\`\`\`properties
cors.allowed-origins=http://localhost:3000,https://your-frontend.com
\`\`\`

## Building for Production

\`\`\`bash
./mvnw clean package
java -jar target/${projectNameKebab}-1.0.0.jar
\`\`\`

## API Endpoints

### Authentication (Proxied to auth-service)

- \`POST ${contextPath}/auth/login\` - Login with username/password
- \`POST ${contextPath}/auth/refresh\` - Refresh expired access token

### Demo Products (Example CRUD)

- \`POST ${contextPath}/demo/products/search\` - Search with filters/pagination
- \`GET ${contextPath}/demo/products/{id}\` - Get by ID
- \`POST ${contextPath}/demo/products\` - Create
- \`PUT ${contextPath}/demo/products/{id}\` - Update
- \`DELETE ${contextPath}/demo/products/{id}\` - Delete

See **Swagger UI** for complete API documentation.

## Demo Code

The \`demo/\` package contains example code that can be safely deleted:

\`\`\`bash
rm -rf src/main/java/${packagePath}/${projectNameSnake}/demo/
\`\`\`

---

Generated from Business App Template (Backend-Only)
- Package: \`${basePackage}.${projectNameSnake}\`
- Entity Code: \`${entityCode}\`
- Auth Service: ${authServiceBaseUrl}
`;
}

main();
