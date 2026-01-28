#!/usr/bin/env node

/**
 * Auth Service Template Generator
 * Creates a new authentication microservice from the template
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

function toSnakeCase(str) {
  return str.toLowerCase().replace(/[-\s]/g, '_');
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

function replaceInAllFiles(dir, replacements, extensions = ['.java', '.properties', '.json', '.html', '.md', '.xml', '.ts', '.tsx', '.js', '.jsx']) {
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
  console.log('Auth Service Template Generator');
  console.log('==========================================\n');

  try {
    const serviceName = await question('Enter service name (e.g., user-auth-service): ');
    const basePackage = await question('Enter base package name (e.g., com.mycompany): ');
    const displayName = await question('Enter display name (e.g., User Authentication Service): ');
    const serverPort = await question('Enter server port (default: 8091): ') || '8091';
    const contextPath = await question('Enter context path (default: /auth): ') || '/auth';
    let targetDir = await question('Enter target directory (default: ../): ');

    targetDir = targetDir || '../';

    const serviceNameKebab = toKebabCase(serviceName);
    const serviceNameSnake = toSnakeCase(serviceName);

    const newProjectDir = path.join(targetDir, serviceNameKebab);
    const packagePath = basePackage.replace(/\./g, '/');

    console.log('\nSummary:');
    console.log('----------------------------------------');
    console.log(`Service Name: ${serviceNameKebab}`);
    console.log(`Package: ${basePackage}.${serviceNameSnake}`);
    console.log(`Display Name: ${displayName}`);
    console.log(`Server Port: ${serverPort}`);
    console.log(`Context Path: ${contextPath}`);
    console.log(`Target Directory: ${newProjectDir}`);
    console.log('----------------------------------------\n');

    const confirm = await question('Proceed with generation? (y/n): ');
    if (confirm.toLowerCase() !== 'y') {
      console.log('Aborted.');
      rl.close();
      return;
    }

    console.log('\nCreating new auth service...');

    // Copy project structure
    console.log('Copying project files...');
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
    console.log('Restructuring Java packages...');
    const oldPackagePath = path.join(newProjectDir, 'src/main/java/com/template/business/auth');
    const newPackagePath = path.join(newProjectDir, `src/main/java/${packagePath}/${serviceNameSnake}`);

    if (fs.existsSync(oldPackagePath)) {
      fs.mkdirSync(newPackagePath, { recursive: true });
      copyDirSync(oldPackagePath, newPackagePath, []);
      fs.rmSync(path.join(newProjectDir, 'src/main/java/com'), { recursive: true, force: true });
    }

    // Prepare replacements
    const replacements = {
      'com\\.template\\.business\\.auth': `${basePackage}.${serviceNameSnake}`,
      'auth-service': serviceNameKebab,
      'Authentication Service': displayName,
      'Auth Service': displayName,
      'authdb': `${serviceNameSnake}db`,
      'server\\.port=8091': `server.port=${serverPort}`,
      'server\\.servlet\\.context-path=/auth': `server.servlet.context-path=${contextPath}`,
      '<groupId>com\\.template</groupId>': `<groupId>${basePackage}</groupId>`,
      '<artifactId>auth-service</artifactId>': `<artifactId>${serviceNameKebab}</artifactId>`,
      '<name>auth-service</name>': `<name>${serviceNameKebab}</name>`,
      'logging\\.level\\.com\\.template\\.business': `logging.level.${basePackage}.${serviceNameSnake}`,
    };

    // Replace in all files
    console.log('Updating configuration files...');
    replaceInAllFiles(newProjectDir, replacements);

    console.log('\n==========================================');
    console.log('✅ Auth Service created successfully!');
    console.log('==========================================\n');
    console.log('Next steps:');
    console.log(`1. cd ${newProjectDir}`);
    console.log('2. Update application.properties with your settings:');
    console.log('   - JWT_SECRET (generate: openssl rand -base64 64)');
    console.log('   - LDAP configuration (if using Active Directory)');
    console.log('   - Database settings (for production)');
    console.log('3. ./mvnw spring-boot:run\n');
    console.log(`Your new auth service is ready at: ${newProjectDir}\n`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    rl.close();
  }
}

main();
