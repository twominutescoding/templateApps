#!/usr/bin/env node

/**
 * Auth Service Template Generator
 * Creates a new authentication microservice from the template
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

function replaceInAllFiles(dir, replacements, extensions = ['.java', '.properties', '.json', '.html', '.md', '.xml', '.lock', '.ts', '.tsx', '.js', '.jsx', '.env']) {
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

// ============================================================================
// Main Function
// ============================================================================

async function main() {
  console.log('==========================================');
  console.log('Auth Service Template Generator');
  console.log('==========================================\n');

  try {
    // ========================================================================
    // User Input - Basic Configuration
    // ========================================================================
    console.log('--- Basic Configuration ---\n');

    const serviceName = await question('Enter service name (e.g., user-auth-service): ');
    const basePackage = await question('Enter base package name (e.g., com.mycompany): ');
    const displayName = await question('Enter display name (e.g., User Authentication Service): ');

    // ========================================================================
    // User Input - Server Configuration
    // ========================================================================
    console.log('\n--- Server Configuration ---\n');

    const serverPort = await question('Enter server port (default: 8091): ') || '8091';
    const contextPath = await question('Enter context path (default: /auth): ') || '/auth';

    // ========================================================================
    // User Input - Entity Configuration
    // ========================================================================
    console.log('\n--- Entity Configuration ---\n');

    const serviceNameSnake = toSnakeCase(serviceName);
    const defaultEntityCode = toUpperSnakeCase(serviceName);
    const entityCode = await question(`Enter entity code (default: ${defaultEntityCode}): `) || defaultEntityCode;

    // ========================================================================
    // User Input - Database Configuration
    // ========================================================================
    console.log('\n--- Database Configuration ---\n');

    const defaultDbName = `${serviceNameSnake}db`;
    const databaseName = await question(`Enter database name (default: ${defaultDbName}): `) || defaultDbName;

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
    const serviceNameKebab = toKebabCase(serviceName);
    const serviceNamePascal = toPascalCase(serviceName);

    const newProjectDir = path.join(targetDir, serviceNameKebab);
    const packagePath = basePackage.replace(/\./g, '/');

    // Ensure contextPath ends with / for Vite base URL
    const viteBase = contextPath.endsWith('/') ? contextPath : `${contextPath}/`;

    // ========================================================================
    // Summary
    // ========================================================================
    console.log('\n==========================================');
    console.log('Summary');
    console.log('==========================================\n');
    console.log(`Service Name:     ${serviceNameKebab}`);
    console.log(`Package:          ${basePackage}.${serviceNameSnake}`);
    console.log(`Display Name:     ${displayName}`);
    console.log(`Server Port:      ${serverPort}`);
    console.log(`Context Path:     ${contextPath}`);
    console.log(`Entity Code:      ${entityCode}`);
    console.log(`Database Name:    ${databaseName}`);
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
    console.log('\nCreating new auth service...\n');

    // Copy project structure
    console.log('[1/4] Copying project files...');
    const sourceDir = __dirname;
    const exclude = [
      /^target$/,
      /^\.git$/,
      /\.log$/,
      /^\.env$/,
      /^node_modules$/,
      /^dist$/,
      /^\.vite$/,
      /^create-auth-project\.js$/,
    ];

    copyDirSync(sourceDir, newProjectDir, exclude);

    // Restructure Java packages
    console.log('[2/4] Restructuring Java packages...');
    const oldPackagePath = path.join(newProjectDir, 'src/main/java/com/template/business/auth');
    const newPackagePath = path.join(newProjectDir, `src/main/java/${packagePath}/${serviceNameSnake}`);

    if (fs.existsSync(oldPackagePath)) {
      fs.mkdirSync(newPackagePath, { recursive: true });
      copyDirSync(oldPackagePath, newPackagePath, []);
      fs.rmSync(path.join(newProjectDir, 'src/main/java/com'), { recursive: true, force: true });
    }

    // Prepare replacements
    console.log('[3/4] Updating configuration files...');

    const replacements = {
      // Package name
      'com\\.template\\.business\\.auth': `${basePackage}.${serviceNameSnake}`,

      // Project names
      'auth-service': serviceNameKebab,

      // Display names
      'Authentication Service': displayName,
      'Auth Service': displayName,

      // Database
      'authdb': databaseName,

      // Server configuration (default values in env vars)
      'SERVER_PORT:8091': `SERVER_PORT:${serverPort}`,
      'CONTEXT_PATH:/auth': `CONTEXT_PATH:${contextPath}`,

      // Vite configuration
      "base: '/auth/'": `base: '${viteBase}'`,
      "'/auth/api/v1'": `'${contextPath}/api/v1'`,
      "'/auth/'": `'${viteBase}'`,

      // Postman collection baseUrl
      'http://localhost:8091/auth/api/v1': `http://localhost:${serverPort}${contextPath}/api/v1`,
      'http://localhost:8091/auth': `http://localhost:${serverPort}${contextPath}`,

      // Maven configuration
      '<finalName>auth</finalName>': `<finalName>${contextPath.replace(/^\//, '')}</finalName>`,
      '<groupId>com\\.template</groupId>': `<groupId>${basePackage}</groupId>`,
      '<artifactId>auth-service</artifactId>': `<artifactId>${serviceNameKebab}</artifactId>`,
      '<name>auth-service</name>': `<name>${serviceNameKebab}</name>`,

      // Logging
      'logging\\.level\\.com\\.template\\.business': `logging.level.${basePackage}.${serviceNameSnake}`,

      // Entity code (for app logging and admin frontend)
      'TEMP_AUTH_SERVICE': entityCode,

      // App logging create-user (default value in env var)
      'LOGGING_CREATE_USER:auth-service': `LOGGING_CREATE_USER:${serviceNameKebab}`,

      // Postman collection - replace all APP001 references with entityCode
      // This covers login entityCode, role assignments, entity filters, etc.
      'APP001': entityCode,
    };

    // Add JWT secret replacement if generated
    if (jwtSecret) {
      replacements['9ff7ff40e4641ffc5e1078ce57f682723c7371612ecc84a0e9c60e786f90cfb0'] = jwtSecret;
    }

    replaceInAllFiles(newProjectDir, replacements);

    // Create README
    console.log('[4/4] Creating README...');
    const readme = `# ${displayName}

This authentication service was generated from the Auth Service Template.

## Overview

A Spring Boot 4.0.1 microservice providing centralized JWT-based authentication.

### Key Features

- **Spring Boot 4.0.1**: Latest version with Java 17+ support
- **Dual Authentication**: Active Directory LDAP (optional) with database fallback
- **Multi-application Support**: Entity-based role filtering via \`entityCode\`
- **JWT Tokens**: HS256 algorithm with 15-minute expiration
- **Refresh Tokens**: 7-day expiration with automatic rotation
- **Admin Frontend**: React 19 admin panel for user/role/session management

## Quick Start

### Development Mode (H2 Database)

\`\`\`bash
./mvnw spring-boot:run
\`\`\`

### Production Mode (Oracle Database)

\`\`\`bash
export SPRING_PROFILES_ACTIVE=prod
export DB_HOST=your-db-host
export DB_PORT=1521
export DB_SID=YOUR_SID
export DB_USERNAME=your_user
export DB_PASSWORD=your_password
./mvnw spring-boot:run
\`\`\`

## Access Points

- **API**: http://localhost:${serverPort}${contextPath}/api/v1/auth
- **Swagger UI**: http://localhost:${serverPort}${contextPath}/swagger-ui.html
- **H2 Console** (dev): http://localhost:${serverPort}${contextPath}/h2-console
  - JDBC URL: \`jdbc:h2:mem:${databaseName}\`
  - Username: \`sa\`
  - Password: (empty)

## Admin Frontend

\`\`\`bash
cd admin-frontend
npm install
npm run dev
# Starts on http://localhost:5174
\`\`\`

Login with: \`admin\` / \`password\`

## Configuration

### JWT Secret
${jwtSecret ? `
Your generated JWT secret:
\`\`\`
${jwtSecret}
\`\`\`

This secret is already configured in the properties files.
` : `
Generate a secure secret:
\`\`\`bash
openssl rand -hex 32
\`\`\`
`}

### LDAP Configuration

To enable Active Directory authentication:

\`\`\`properties
ldap.enabled=true
ldap.url=ldaps://your-ad-server:636
ldap.base=your.domain.local
\`\`\`

## API Endpoints

- \`POST ${contextPath}/api/v1/auth/login\` - Login with username/password/entityCode
- \`POST ${contextPath}/api/v1/auth/register\` - Register new user
- \`POST ${contextPath}/api/v1/auth/refresh\` - Refresh JWT token
- \`GET ${contextPath}/api/v1/auth/validate\` - Validate JWT token
- \`GET ${contextPath}/api/v1/auth/health\` - Health check

## Sample Users (Dev Only)

| Username | Password | Roles |
|----------|----------|-------|
| admin | password | ADMIN |
| user1 | password | USER, MANAGER |
| user2 | password | USER |

---

Generated from Auth Service Template
- Package: \`${basePackage}.${serviceNameSnake}\`
- Entity Code: \`${entityCode}\`
`;

    fs.writeFileSync(path.join(newProjectDir, 'README.md'), readme, 'utf8');

    // ========================================================================
    // Success Message
    // ========================================================================
    console.log('\n==========================================');
    console.log('Project created successfully!');
    console.log('==========================================\n');

    console.log('Next steps:\n');
    console.log(`1. cd ${newProjectDir}`);
    console.log('2. ./mvnw spring-boot:run');
    console.log(`3. Open http://localhost:${serverPort}${contextPath}/swagger-ui.html\n`);

    if (jwtSecret) {
      console.log('JWT Secret (save this for other services):');
      console.log(`${jwtSecret}\n`);
    }

    console.log(`Your new auth service is ready at: ${newProjectDir}\n`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    rl.close();
  }
}

main();
