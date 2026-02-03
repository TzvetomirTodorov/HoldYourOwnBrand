#!/bin/bash
#
# HYOW Testing Suite Setup Script
#
# This script sets up the complete testing infrastructure for HoldYourOwnBrand.
# Run it once from your project root directory.
#
# What it does:
# 1. Installs testing dependencies (Vitest, React Testing Library, etc.)
# 2. Installs linting dependencies (ESLint plugins)
# 3. Installs git hooks (Husky + lint-staged)
# 4. Creates necessary directories
# 5. Copies configuration files to the right places
#
# Usage:
#   cd ~/OneDrive/Documents/PersonalProjects/HoldYourOwnBrand
#   bash setup-testing.sh
#

set -e  # Exit on any error

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          HYOW Testing Suite Setup                            ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check we're in the right directory
if [ ! -d "client" ] || [ ! -d "server" ]; then
  echo "❌ Error: Please run this script from the HoldYourOwnBrand root directory"
  echo "   Expected to find 'client' and 'server' folders"
  exit 1
fi

echo "📦 Step 1: Installing client testing dependencies..."
echo ""
cd client

# Core testing libraries
npm install --save-dev vitest @vitest/coverage-v8

# React Testing Library
npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event

# jsdom for browser environment simulation
npm install --save-dev jsdom

# ESLint plugins (if not already installed)
npm install --save-dev eslint eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-jsx-a11y eslint-plugin-vitest

# Husky and lint-staged for pre-commit hooks
npm install --save-dev husky lint-staged

echo ""
echo "✅ Client dependencies installed"
echo ""

# Go back to root
cd ..

echo "📦 Step 2: Installing server testing dependencies..."
echo ""
cd server

# ESLint for server
npm install --save-dev eslint

echo ""
echo "✅ Server dependencies installed"
echo ""

# Go back to root
cd ..

echo "🔧 Step 3: Setting up Husky (git hooks)..."
echo ""

# Initialize Husky
npx husky init 2>/dev/null || true

# Make sure .husky directory exists
mkdir -p .husky

echo ""
echo "✅ Husky initialized"
echo ""

echo "📁 Step 4: Creating test directories..."
echo ""

# Create test directories in client
mkdir -p client/src/test
mkdir -p client/src/pages/__tests__
mkdir -p client/src/components/__tests__
mkdir -p client/src/store/__tests__
mkdir -p client/src/hooks/__tests__
mkdir -p client/src/utils/__tests__

# Create GitHub Actions directory
mkdir -p .github/workflows

echo "✅ Test directories created"
echo ""

echo "📝 Step 5: Adding npm scripts to client/package.json..."
echo ""

# Check if scripts already exist, if not add them
cd client
if ! grep -q '"test"' package.json; then
  # Use node to safely add scripts to package.json
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts = pkg.scripts || {};
    pkg.scripts.test = 'vitest';
    pkg.scripts['test:run'] = 'vitest run';
    pkg.scripts['test:coverage'] = 'vitest run --coverage';
    pkg.scripts['test:ui'] = 'vitest --ui';
    pkg.scripts.lint = 'eslint src --ext .js,.jsx';
    pkg.scripts['lint:fix'] = 'eslint src --ext .js,.jsx --fix';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  "
  echo "✅ npm scripts added"
else
  echo "ℹ️  npm scripts already exist, skipping"
fi
cd ..

echo ""
echo "📝 Step 6: Adding npm scripts to server/package.json..."
echo ""

cd server
if ! grep -q '"lint"' package.json 2>/dev/null; then
  node -e "
    const fs = require('fs');
    const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
    pkg.scripts = pkg.scripts || {};
    pkg.scripts.lint = 'eslint src --ext .js';
    pkg.scripts['lint:fix'] = 'eslint src --ext .js --fix';
    pkg.scripts['check-syntax'] = 'find src -name \"*.js\" -exec node --check {} \\;';
    fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
  " 2>/dev/null || echo "ℹ️  Could not modify server package.json"
fi
cd ..

echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║          ✅ Setup Complete!                                  ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Next steps:"
echo ""
echo "   1. Copy the configuration files to your project:"
echo "      - vitest.config.js → client/vitest.config.js"
echo "      - .eslintrc.cjs → client/.eslintrc.cjs"
echo "      - lint-staged.config.cjs → ./lint-staged.config.cjs (root)"
echo "      - src/test/setup.js → client/src/test/setup.js"
echo "      - src/test/utils.jsx → client/src/test/utils.jsx"
echo "      - .husky/pre-commit → .husky/pre-commit"
echo "      - .github/workflows/ci.yml → .github/workflows/ci.yml"
echo ""
echo "   2. Make the pre-commit hook executable:"
echo "      chmod +x .husky/pre-commit"
echo ""
echo "   3. Test the setup:"
echo "      cd client && npm test"
echo ""
echo "   4. Try a commit to verify pre-commit hooks work:"
echo "      git add ."
echo "      git commit -m 'test: add testing infrastructure'"
echo ""
echo "🐾 Happy testing!"
echo ""
