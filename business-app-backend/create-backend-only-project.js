#!/usr/bin/env node

/**
 * Business App Backend-Only Template Generator
 * Creates a backend-only API project (no frontend) with external auth-service integration
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
  console.log('Backend-Only Business App Template Generator');
  console.log('==========================================\n');

  try {
    // ========================================================================
    // User Input - Basic Configuration
    // ========================================================================
    console.log('--- Basic Configuration ---\n');

    const projectName = await question('Enter project name (e.g., inventory-api): ');
    const basePackage = await question('Enter base package name (e.g., com.mycompany): ');
    const displayName = await question('Enter display name (e.g., Inventory API): ');

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

    // ========================================================================
    // Summary
    // ========================================================================
    console.log('\n==========================================');
    console.log('Summary');
    console.log('==========================================\n');
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
    console.log(`Type:             Backend-Only (No Frontend)`);
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
    console.log('\nCreating new backend-only project...\n');

    // Copy project structure (EXCLUDING frontend directory)
    console.log('[1/5] Copying backend files only...');
    const sourceDir = __dirname;
    const exclude = [
      /^target$/,
      /^node_modules$/,
      /^dist$/,
      /^\.vite$/,
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

    // Delete static folder if it exists in resources
    const staticDir = path.join(newProjectDir, 'src/main/resources/static');
    if (fs.existsSync(staticDir)) {
      fs.rmSync(staticDir, { recursive: true, force: true });
    }

    // Restructure Java packages
    console.log('[2/5] Restructuring Java packages...');
    const oldPackagePath = path.join(newProjectDir, 'src/main/java/com/template/business');
    const newPackagePath = path.join(newProjectDir, `src/main/java/${packagePath}/${projectNameSnake}`);

    if (fs.existsSync(oldPackagePath)) {
      fs.mkdirSync(newPackagePath, { recursive: true });
      copyDirSync(oldPackagePath, newPackagePath, []);
      fs.rmSync(path.join(newProjectDir, 'src/main/java/com'), { recursive: true, force: true });
    }

    // Prepare replacements
    console.log('[3/5] Updating configuration files...');

    const replacements = {
      // Package name
      'com\\.template\\.business': `${basePackage}.${projectNameSnake}`,

      // Project names
      'business-app-backend': projectNameKebab,

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

      // CORS - remove React dev server defaults for backend-only
      'cors\\.allowed-origins=\\$\\{CORS_ORIGINS:http://localhost:5173,http://localhost:3000\\}': `cors.allowed-origins=\${CORS_ORIGINS:http://localhost:3000}`,

      // Logging
      'logging\\.level\\.com\\.template\\.business': `logging.level.${basePackage}.${projectNameSnake}`,

      // Entity code (for auth-service login and app logging)
      'BUSINESS_APP': entityCode,

      // App logging create-user
      'app\\.logging\\.create-user=\\$\\{APP_LOGGING_CREATE_USER:business-app-backend\\}': `app.logging.create-user=\${APP_LOGGING_CREATE_USER:${projectNameKebab}}`,
    };

    // Add JWT secret replacement if generated
    if (jwtSecret) {
      replacements['9ff7ff40e4641ffc5e1078ce57f682723c7371612ecc84a0e9c60e786f90cfb0'] = jwtSecret;
    }

    replaceInAllFiles(newProjectDir, replacements);

    // Remove frontend plugins from pom.xml
    console.log('[4/5] Removing frontend Maven plugins from pom.xml...');
    const pomPath = path.join(newProjectDir, 'pom.xml');
    removeFrontendPluginsFromPom(pomPath);

    // Create README
    console.log('[5/5] Creating README...');
    const readme = `# ${displayName}

This backend-only API was generated from the Business App Backend-Only Template.

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

Generated from Business App Backend-Only Template
- Package: \`${basePackage}.${projectNameSnake}\`
- Entity Code: \`${entityCode}\`
- Auth Service: ${authServiceBaseUrl}
`;

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
    console.log(`2. Start backend API (${projectNameKebab}):`);
    console.log(`   cd ${newProjectDir}`);
    console.log('   ./mvnw spring-boot:run\n');
    console.log(`3. Open Swagger UI:`);
    console.log(`   http://localhost:${serverPort}${contextPath}/swagger-ui.html\n`);
    console.log('4. Test API with curl:');
    console.log(`   curl -X POST http://localhost:${serverPort}${contextPath}/auth/login \\`);
    console.log('     -H "Content-Type: application/json" \\');
    console.log(`     -d '{"username":"admin","password":"password","entityCode":"${entityCode}"}'`);

    if (jwtSecret) {
      console.log('\nJWT Secret (must match auth-service):');
      console.log(`${jwtSecret}`);
    }

    console.log(`\nYour new backend API is ready at: ${newProjectDir}\n`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    rl.close();
  }
}

main();
