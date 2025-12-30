#!/usr/bin/env node

/**
 * Business App Template Generator (Node.js version)
 * Cross-platform alternative to the bash script
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
    let targetDir = await question('Enter target directory (default: ../): ');

    targetDir = targetDir || '../';

    const projectNameKebab = toKebabCase(projectName);
    const projectNameSnake = toSnakeCase(projectName);
    const projectNamePascal = toPascalCase(projectName);

    const newProjectDir = path.join(targetDir, projectNameKebab);
    const packagePath = basePackage.replace(/\./g, '/');

    console.log('\nSummary:');
    console.log('----------------------------------------');
    console.log(`Project Name: ${projectNameKebab}`);
    console.log(`Package: ${basePackage}.${projectNameSnake}`);
    console.log(`Display Name: ${appDisplayName}`);
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
    console.log('Copying project files...');
    const sourceDir = __dirname;
    const exclude = [
      /^target$/,
      /^node_modules$/,
      /^dist$/,
      /^\.git$/,
      /\.log$/,
      /^\.env$/,
      /^create-new-project\.sh$/,
      /^create-project\.js$/,
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
    const replacements = {
      'com\\.template\\.business': `${basePackage}.${projectNameSnake}`,
      'business-app-backend': projectNameKebab,
      'business-app-frontend': `${projectNameKebab}-frontend`,
      'business-app-template': projectNameKebab,
      'Business App Template': appDisplayName,
      'Business App': appDisplayName,
      'businessdb': `${projectNameSnake}db`,
      '<groupId>com\\.template</groupId>': `<groupId>${basePackage}</groupId>`,
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

## Project Structure

- **Backend**: Spring Boot 3.4.0 (Java 21)
- **Frontend**: React 19 with TypeScript and Vite
- **Database**: H2 (in-memory) for development
- **Authentication**: JWT-based
- **UI Library**: Material-UI (MUI) v7

## Quick Start

### Backend
\`\`\`bash
./mvnw spring-boot:run
\`\`\`

### Frontend (Development)
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`

## Access

- Backend API: http://localhost:8080
- Frontend Dev: http://localhost:5173
- H2 Console: http://localhost:8080/h2-console

## Default Users

- Admin: admin@example.com / admin123
- Manager: manager@example.com / manager123

---

Generated from Business App Template
`;

    fs.writeFileSync(path.join(newProjectDir, 'README.md'), readme, 'utf8');

    console.log('\n==========================================');
    console.log('✅ Project created successfully!');
    console.log('==========================================\n');
    console.log('Next steps:');
    console.log(`1. cd ${newProjectDir}`);
    console.log('2. ./mvnw spring-boot:run      # Start backend');
    console.log('3. cd frontend && npm install  # Install frontend dependencies');
    console.log('4. npm run dev                 # Start frontend dev server\n');
    console.log(`Your new project is ready at: ${newProjectDir}\n`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    rl.close();
  }
}

main();
