#!/bin/bash

# Business App Template Generator
# This script creates a new project from the template with custom names

set -e

echo "=========================================="
echo "Business App Template Generator"
echo "=========================================="
echo ""

# Function to convert string to different cases
to_lowercase() {
    echo "$1" | tr '[:upper:]' '[:lower:]'
}

to_uppercase() {
    echo "$1" | tr '[:lower:]' '[:upper:]'
}

to_camelcase() {
    echo "$1" | sed -r 's/(^|-)([a-z])/\U\2/g' | sed 's/-//g'
}

to_pascalcase() {
    local camel=$(to_camelcase "$1")
    echo "${camel^}"
}

to_kebabcase() {
    echo "$1" | sed 's/\([A-Z]\)/-\1/g' | tr '[:upper:]' '[:lower:]' | sed 's/^-//'
}

# Get user input
read -p "Enter project name (e.g., inventory-management): " PROJECT_NAME
read -p "Enter base package name (e.g., com.mycompany): " BASE_PACKAGE
read -p "Enter application display name (e.g., Inventory Management): " APP_DISPLAY_NAME
read -p "Enter target directory (default: ../): " TARGET_DIR

# Set defaults
TARGET_DIR=${TARGET_DIR:-"../"}
PROJECT_NAME_LOWER=$(to_lowercase "$PROJECT_NAME")
PROJECT_NAME_KEBAB=$(to_kebabcase "$PROJECT_NAME")
PROJECT_NAME_PASCAL=$(to_pascalcase "$PROJECT_NAME")
PROJECT_NAME_CAMEL=$(to_camelcase "$PROJECT_NAME")

# Derived values
NEW_PROJECT_DIR="${TARGET_DIR}/${PROJECT_NAME_KEBAB}"
PACKAGE_PATH=$(echo "$BASE_PACKAGE" | tr '.' '/')
APP_NAME_SNAKE=$(echo "$PROJECT_NAME_LOWER" | tr '-' '_')

echo ""
echo "Summary:"
echo "----------------------------------------"
echo "Project Name: $PROJECT_NAME_KEBAB"
echo "Package: ${BASE_PACKAGE}.${APP_NAME_SNAKE}"
echo "Display Name: $APP_DISPLAY_NAME"
echo "Target Directory: $NEW_PROJECT_DIR"
echo "----------------------------------------"
echo ""

read -p "Proceed with generation? (y/n): " CONFIRM
if [ "$CONFIRM" != "y" ]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "Creating new project..."

# Create target directory
mkdir -p "$NEW_PROJECT_DIR"

# Copy entire project structure
echo "Copying project files..."
rsync -av --exclude='target' \
          --exclude='node_modules' \
          --exclude='dist' \
          --exclude='.git' \
          --exclude='*.log' \
          --exclude='.env' \
          --exclude='create-new-project.sh' \
          ./ "$NEW_PROJECT_DIR/"

cd "$NEW_PROJECT_DIR"

# Rename Java package structure
echo "Restructuring Java packages..."
OLD_PACKAGE_PATH="src/main/java/com/template/business"
NEW_PACKAGE_PATH="src/main/java/${PACKAGE_PATH}/${APP_NAME_SNAKE}"

mkdir -p "$NEW_PACKAGE_PATH"
if [ -d "$OLD_PACKAGE_PATH" ]; then
    cp -r "$OLD_PACKAGE_PATH"/* "$NEW_PACKAGE_PATH/"
    rm -rf src/main/java/com/template
fi

# Update pom.xml
echo "Updating pom.xml..."
sed -i "s|<groupId>com.template</groupId>|<groupId>${BASE_PACKAGE}</groupId>|g" pom.xml
sed -i "s|<artifactId>business-app-backend</artifactId>|<artifactId>${PROJECT_NAME_KEBAB}</artifactId>|g" pom.xml
sed -i "s|<name>business-app-backend</name>|<name>${PROJECT_NAME_KEBAB}</name>|g" pom.xml
sed -i "s|<description>Business Application Template</description>|<description>${APP_DISPLAY_NAME}</description>|g" pom.xml

# Update all Java files - package declarations and imports
echo "Updating Java package declarations..."
find src/main/java -type f -name "*.java" -exec sed -i \
    "s|package com.template.business|package ${BASE_PACKAGE}.${APP_NAME_SNAKE}|g" {} \;
find src/main/java -type f -name "*.java" -exec sed -i \
    "s|import com.template.business|import ${BASE_PACKAGE}.${APP_NAME_SNAKE}|g" {} \;

# Update application.properties
echo "Updating application.properties..."
sed -i "s|spring.application.name=business-app-backend|spring.application.name=${PROJECT_NAME_KEBAB}|g" \
    src/main/resources/application.properties
sed -i "s|jdbc:h2:mem:businessdb|jdbc:h2:mem:${APP_NAME_SNAKE}db|g" \
    src/main/resources/application.properties
sed -i "s|logging.level.com.template.business|logging.level.${BASE_PACKAGE}.${APP_NAME_SNAKE}|g" \
    src/main/resources/application.properties

# Update frontend package.json
echo "Updating frontend package.json..."
cd frontend
if [ -f "package.json" ]; then
    sed -i "s|\"name\": \"business-app-template\"|\"name\": \"${PROJECT_NAME_KEBAB}\"|g" package.json
    sed -i "s|\"name\": \"business-app-frontend\"|\"name\": \"${PROJECT_NAME_KEBAB}-frontend\"|g" package.json
    sed -i "s|\"Business App Template\"|\"${APP_DISPLAY_NAME}\"|g" package.json
fi

# Update package-lock.json
if [ -f "package-lock.json" ]; then
    sed -i "s|\"name\": \"business-app-template\"|\"name\": \"${PROJECT_NAME_KEBAB}\"|g" package-lock.json
fi

# Update frontend index.html
if [ -f "index.html" ]; then
    sed -i "s|<title>business-app-template</title>|<title>${APP_DISPLAY_NAME}</title>|g" index.html
    sed -i "s|<title>Business App</title>|<title>${APP_DISPLAY_NAME}</title>|g" index.html
fi

# Update frontend vite.config.ts
if [ -f "vite.config.ts" ]; then
    sed -i "s|outputDir: '../src/main/resources/static'|outputDir: '../src/main/resources/static'|g" vite.config.ts
fi

cd ..

# Create new README
echo "Creating README..."
cat > README.md <<EOF
# ${APP_DISPLAY_NAME}

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

### Frontend (Build for Production)
\`\`\`bash
cd frontend
npm run build
\`\`\`

## Access

- Backend API: http://localhost:8080
- Frontend Dev: http://localhost:5173
- H2 Console: http://localhost:8080/h2-console
  - JDBC URL: jdbc:h2:mem:${APP_NAME_SNAKE}db
  - Username: sa
  - Password: (empty)

## Default Users

- Admin: admin@example.com / admin123
- Manager: manager@example.com / manager123
- User: john@example.com / password123

## Features

- ✅ Advanced data table with filtering, sorting, pagination
- ✅ Inline and bulk editing
- ✅ Row selection and export (CSV/JSON)
- ✅ Master-detail relationship (row click)
- ✅ Manual/auto filter modes
- ✅ Dark mode with custom color palettes
- ✅ Date/timestamp formatting
- ✅ JWT authentication
- ✅ Responsive Material-UI design

## Demo Package

The \`demo\` package contains example code. You can safely delete it when starting real development:
\`\`\`bash
rm -rf src/main/java/${PACKAGE_PATH}/${APP_NAME_SNAKE}/demo/
\`\`\`

## Documentation

See \`claude.md\` for detailed documentation about the project structure and design decisions.

---

Generated from Business App Template
EOF

# Update H2 database name in application.properties
sed -i "s|jdbc:h2:mem:businessappdb|jdbc:h2:mem:${APP_NAME_SNAKE}db|g" \
    src/main/resources/application.properties

# Update claude.md with new project name
if [ -f "claude.md" ]; then
    sed -i "s|Business App Template|${APP_DISPLAY_NAME}|g" claude.md
    sed -i "s|business-app-backend|${PROJECT_NAME_KEBAB}|g" claude.md
    sed -i "s|com.template.business|${BASE_PACKAGE}.${APP_NAME_SNAKE}|g" claude.md
fi

echo ""
echo "=========================================="
echo "✅ Project created successfully!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. cd $NEW_PROJECT_DIR"
echo "2. ./mvnw spring-boot:run      # Start backend"
echo "3. cd frontend && npm install  # Install frontend dependencies"
echo "4. npm run dev                 # Start frontend dev server"
echo ""
echo "Your new project is ready at: $NEW_PROJECT_DIR"
echo ""
