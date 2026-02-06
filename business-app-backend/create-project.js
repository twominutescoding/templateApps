#!/usr/bin/env node

/**
 * Business App Template Generator (Node.js version)
 * Cross-platform project generator with external auth-service integration
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

async function main() {
  console.log('==========================================');
  console.log('Business App Template Generator');
  console.log('==========================================\n');

  try {
    const projectName = await question('Enter project name (e.g., inventory-management): ');
    const basePackage = await question('Enter base package name (e.g., com.mycompany): ');
    const appDisplayName = await question('Enter application display name (e.g., Inventory Management): ');
    const serverPort = await question('Enter server port (default: 8090): ') || '8090';
    const contextPath = await question('Enter context path (default: /api): ') || '/api';

    // Auth service configuration
    console.log('\n--- Auth Service Configuration ---');
    const authServiceHost = await question('Enter auth-service host (default: localhost): ') || 'localhost';
    const authServicePort = await question('Enter auth-service port (default: 8091): ') || '8091';
    const authServiceContext = await question('Enter auth-service context path (default: /auth): ') || '/auth';

    let targetDir = await question('\nEnter target directory (default: ../): ');

    targetDir = targetDir || '../';

    const projectNameKebab = toKebabCase(projectName);
    const projectNameSnake = toSnakeCase(projectName);
    const projectNamePascal = toPascalCase(projectName);

    // Build auth-service URLs from components
    const authServiceBaseUrl = `http://${authServiceHost}:${authServicePort}${authServiceContext}`;
    const authServiceUrl = `${authServiceBaseUrl}/api/v1/auth/login`;
    const authServiceRefreshUrl = `${authServiceBaseUrl}/api/v1/auth/refresh`;
    const authServiceLogUrl = `${authServiceBaseUrl}/api/v1/logs`;

    const newProjectDir = path.join(targetDir, projectNameKebab);
    const packagePath = basePackage.replace(/\./g, '/');

    console.log('\nSummary:');
    console.log('----------------------------------------');
    console.log(`Project Name: ${projectNameKebab}`);
    console.log(`Package: ${basePackage}.${projectNameSnake}`);
    console.log(`Display Name: ${appDisplayName}`);
    console.log(`Server Port: ${serverPort}`);
    console.log(`Context Path: ${contextPath}`);
    console.log(`Auth Service Base: ${authServiceBaseUrl}`);
    console.log(`  - Login URL: ${authServiceUrl}`);
    console.log(`  - Refresh URL: ${authServiceRefreshUrl}`);
    console.log(`  - Log URL: ${authServiceLogUrl}`);
    console.log(`Target Directory: ${newProjectDir}`);
    console.log('----------------------------------------\n');

    const confirm = await question('Proceed with generation? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Aborted.');
      rl.close();
      return;
    }

    console.log('\nCreating new project...');

    // Copy project structure
    console.log('Copying project files (including docs folder)...');
    const sourceDir = __dirname;
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

    copyDirSync(sourceDir, newProjectDir, exclude);

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
    // Ensure contextPath ends with / for Vite base URL
    const viteBase = contextPath.endsWith('/') ? contextPath : `${contextPath}/`;

    const replacements = {
      'com\\.template\\.business': `${basePackage}.${projectNameSnake}`,
      'business-app-backend': projectNameKebab,
      'business-app-frontend': `${projectNameKebab}-frontend`,
      'business-app-template': projectNameKebab,
      'Business App Template': appDisplayName,
      'Business Application Backend Template': appDisplayName,
      'Business App': appDisplayName,
      'businessdb': `${projectNameSnake}db`,
      'server\\.port=8090': `server.port=${serverPort}`,
      // Update context path
      'server\\.servlet\\.context-path=/api': `server.servlet.context-path=${contextPath}`,
      // Update Vite base URL to match context path
      "base: '/api/'": `base: '${viteBase}'`,
      // Update API base URL in api.ts
      "VITE_API_BASE_URL \\|\\| '/api'": `VITE_API_BASE_URL || '${contextPath}'`,
      // Update finalName in pom.xml to match context path (for Tomcat deployment)
      '<finalName>api</finalName>': `<finalName>${contextPath.replace(/^\//, '')}</finalName>`,
      'AUTH_SERVICE_URL:http://localhost:8091/auth/api/v1/auth/login': `AUTH_SERVICE_URL:${authServiceUrl}`,
      'AUTH_SERVICE_REFRESH_URL:http://localhost:8091/auth/api/v1/auth/refresh': `AUTH_SERVICE_REFRESH_URL:${authServiceRefreshUrl}`,
      'AUTH_SERVICE_LOG_URL:http://localhost:8091/auth/api/v1/logs': `AUTH_SERVICE_LOG_URL:${authServiceLogUrl}`,
      '<groupId>com\\.template</groupId>': `<groupId>${basePackage}</groupId>`,
      '<artifactId>business-app-backend</artifactId>': `<artifactId>${projectNameKebab}</artifactId>`,
      '<name>business-app-backend</name>': `<name>${projectNameKebab}</name>`,
      'logging\\.level\\.com\\.template\\.business': `logging.level.${basePackage}.${projectNameSnake}`,
    };

    // Replace in all files
    console.log('Updating configuration files...');
    replaceInAllFiles(newProjectDir, replacements);

    // Create new README
    console.log('Creating README...');
    const readme = `# ${appDisplayName}

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
   - Clone and start auth-service on port 8091
   - See: https://github.com/your-org/auth-service

2. Java 17 or higher
3. Node.js 18+ and npm
4. Maven 3.6+

## Quick Start

### 1. Start Auth Service (Required!)
\`\`\`bash
# In a separate terminal
cd ../auth-service
./mvnw spring-boot:run
# Wait for: "Started AuthServiceApplication on port 8091"
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

## Access

- **Frontend**: http://localhost:5173 (dev) or http://localhost:${serverPort}${contextPath}/ (production)
- **Backend API**: http://localhost:${serverPort}${contextPath}
- **Swagger UI**: http://localhost:${serverPort}${contextPath}/swagger-ui.html
- **H2 Console**: http://localhost:${serverPort}${contextPath}/h2-console
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

This app is configured to use auth-service at:
- **Base URL**: ${authServiceBaseUrl}
- **Login**: ${authServiceUrl}
- **Refresh**: ${authServiceRefreshUrl}
- **Logging**: ${authServiceLogUrl}

To change this, update \`application.properties\`:
\`\`\`properties
auth.service.url=\${AUTH_SERVICE_URL:${authServiceUrl}}
auth.service.refresh-url=\${AUTH_SERVICE_REFRESH_URL:${authServiceRefreshUrl}}
auth.service.log-url=\${AUTH_SERVICE_LOG_URL:${authServiceLogUrl}}
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

## Documentation

Detailed documentation is available in the [\`docs/\`](docs/) folder:

- **[Exception Handling](docs/EXCEPTION_HANDLING.md)** - Error handling guide
- **[Exception Migration Guide](docs/EXCEPTION_MIGRATION_GUIDE.md)** - Migrating exceptions
- **[External Auth Refactoring](docs/EXTERNAL_AUTH_REFACTORING.md)** - Auth architecture

## Building for Production

### Backend + Frontend (Single JAR)
\`\`\`bash
cd frontend
npm install
npm run build  # Outputs to src/main/resources/static/

cd ..
./mvnw clean package
java -jar target/${projectNameKebab}-1.0.0.jar
\`\`\`

### Backend Only
\`\`\`bash
./mvnw clean package -Dmaven.test.skip=true
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

## Features Included

✅ JWT authentication via external auth-service
✅ Automatic token refresh (7-day refresh tokens)
✅ Global exception handling with custom error codes
✅ Advanced data table with filtering, sorting, pagination
✅ Bulk operations support
✅ Demo products page (safe to delete)
✅ Dark mode and theme customization
✅ Comprehensive API documentation (Swagger)
✅ CORS configuration for frontend
✅ H2 database for development

## Demo Code

The \`demo/\` package contains example code that can be safely deleted:
- \`com.template.business.demo\` - Demo products CRUD
- \`frontend/src/pages/demo\` - Demo products page

## Support

For issues and questions, check:
- Code documentation in \`docs/\` folder
- Swagger UI for API documentation
- Session notes in \`claude.md\`

---

Generated from Business App Template
Package: ${basePackage}.${projectNameSnake}
Auth Service: ${authServiceUrl}
`;

    fs.writeFileSync(path.join(newProjectDir, 'README.md'), readme, 'utf8');

    console.log('\n==========================================');
    console.log('✅ Project created successfully!');
    console.log('==========================================\n');
    console.log('Next steps:');
    console.log('\n1. Start auth-service (REQUIRED):');
    console.log('   cd ../auth-service');
    console.log('   ./mvnw spring-boot:run');
    console.log(`\n2. Start your backend (${projectNameKebab}):`);
    console.log(`   cd ${newProjectDir}`);
    console.log('   ./mvnw spring-boot:run');
    console.log('\n3. Install and start frontend:');
    console.log('   cd frontend');
    console.log('   npm install');
    console.log('   npm run dev');
    console.log('\n4. Open browser:');
    console.log('   http://localhost:5173');
    console.log('\n5. Login with:');
    console.log('   Username: admin');
    console.log('   Password: password');
    console.log('\nIMPORTANT: Set matching JWT_SECRET in both services!');
    console.log(`\nYour new project is ready at: ${newProjectDir}\n`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    rl.close();
  }
}

main();
