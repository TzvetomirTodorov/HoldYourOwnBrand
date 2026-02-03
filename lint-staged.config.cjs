/**
 * Lint-Staged Configuration for HYOW E-Commerce
 * 
 * This file defines what commands run on staged files before each commit.
 * It runs ONLY on files you're about to commit, making it fast.
 * 
 * Flow:
 * 1. You run `git commit`
 * 2. Husky triggers pre-commit hook
 * 3. lint-staged runs these commands on staged files
 * 4. If all pass → commit proceeds
 * 5. If any fail → commit is blocked
 */

module.exports = {
  // ============================================================================
  // JAVASCRIPT & JSX FILES
  // ============================================================================
  
  // For JS/JSX files in client/src
  'client/src/**/*.{js,jsx}': [
    // Step 1: Run ESLint to catch syntax errors and code quality issues
    // --max-warnings 0 means ANY warning blocks the commit
    'eslint --max-warnings 0',
    
    // Step 2: Run related tests for changed files
    // --passWithNoTests prevents failure if no tests exist for the file
    // --bail stops on first test failure (faster feedback)
    'vitest related --run --passWithNoTests --bail',
  ],
  
  // For JS files in server/src
  'server/src/**/*.js': [
    // Syntax check using Node.js
    // This catches the type of error that crashed your server!
    'node --check',
    
    // ESLint for code quality
    'eslint --max-warnings 0',
  ],
  
  // ============================================================================
  // CSS FILES
  // ============================================================================
  
  '**/*.css': [
    // Just check syntax - you could add Stylelint here later
    // For now, we skip CSS linting to keep things simple
  ],
  
  // ============================================================================
  // JSON FILES
  // ============================================================================
  
  '**/*.json': [
    // Validate JSON syntax
    // This catches malformed package.json, tsconfig.json, etc.
    'node -e "JSON.parse(require(\'fs\').readFileSync(process.argv[1]))"',
  ],
  
  // ============================================================================
  // PACKAGE FILES (extra careful)
  // ============================================================================
  
  'package.json': [
    // Validate JSON
    'node -e "JSON.parse(require(\'fs\').readFileSync(process.argv[1]))"',
  ],
};
