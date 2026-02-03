/**
 * ESLint Configuration for HYOW E-Commerce
 * 
 * This configuration:
 * - Catches syntax errors (like the missing parenthesis that crashed your server!)
 * - Enforces React best practices
 * - Ensures consistent code style
 * - Catches common bugs before they reach production
 */

module.exports = {
  root: true,
  
  // Environment settings
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  
  // Extend recommended rule sets
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:react-hooks/recommended',
    'plugin:jsx-a11y/recommended',
  ],
  
  // Parser options for modern JavaScript
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  
  // Plugins
  plugins: [
    'react',
    'react-hooks',
    'jsx-a11y',
  ],
  
  // React version detection
  settings: {
    react: {
      version: 'detect',
    },
  },
  
  // Custom rules
  rules: {
    // ========================================================================
    // ERROR PREVENTION (these catch bugs like what crashed your server)
    // ========================================================================
    
    // Catches syntax errors
    'no-unexpected-multiline': 'error',
    
    // Catches missing variables
    'no-undef': 'error',
    
    // Catches unreachable code
    'no-unreachable': 'error',
    
    // Catches duplicate keys in objects
    'no-dupe-keys': 'error',
    
    // Catches duplicate case labels in switch
    'no-duplicate-case': 'error',
    
    // Catches invalid regular expressions
    'no-invalid-regexp': 'error',
    
    // Catches calling non-functions
    'no-func-assign': 'error',
    
    // Catches assignment in conditions (usually a typo)
    'no-cond-assign': 'error',
    
    // ========================================================================
    // REACT SPECIFIC
    // ========================================================================
    
    // Catches missing keys in lists
    'react/jsx-key': 'error',
    
    // Catches typos in prop types
    'react/no-typos': 'error',
    
    // Catches using array index as key (usually bad for performance)
    'react/no-array-index-key': 'warn',
    
    // Allow JSX without importing React (React 17+)
    'react/react-in-jsx-scope': 'off',
    
    // Allow prop-types to be optional (we're not using TypeScript)
    'react/prop-types': 'off',
    
    // Warn about unused state
    'react/no-unused-state': 'warn',
    
    // ========================================================================
    // REACT HOOKS
    // ========================================================================
    
    // Enforces Rules of Hooks (critical!)
    'react-hooks/rules-of-hooks': 'error',
    
    // Warns about missing dependencies in useEffect/useCallback/useMemo
    'react-hooks/exhaustive-deps': 'warn',
    
    // ========================================================================
    // CODE QUALITY
    // ========================================================================
    
    // Warns about console.log (should be removed before production)
    'no-console': ['warn', { allow: ['warn', 'error'] }],
    
    // Warns about unused variables
    'no-unused-vars': ['warn', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
    }],
    
    // Catches debugger statements
    'no-debugger': 'error',
    
    // Catches empty blocks
    'no-empty': 'warn',
    
    // ========================================================================
    // ACCESSIBILITY
    // ========================================================================
    
    // Require alt text on images
    'jsx-a11y/alt-text': 'error',
    
    // Require labels on form inputs
    'jsx-a11y/label-has-associated-control': 'warn',
    
    // Warn about click handlers without keyboard handlers
    'jsx-a11y/click-events-have-key-events': 'warn',
    
    // Allow autofocus (sometimes needed for UX)
    'jsx-a11y/no-autofocus': 'off',
  },
  
  // Override rules for specific file patterns
  overrides: [
    // Test files have different needs
    {
      files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}', '**/test/**'],
      env: {
        'vitest-globals/env': true,
      },
      plugins: ['vitest'],
      rules: {
        // Allow console in tests
        'no-console': 'off',
        // Allow unused vars in tests (often used for destructuring)
        'no-unused-vars': 'off',
      },
    },
    // Config files
    {
      files: ['*.config.{js,cjs,mjs}', '.eslintrc.cjs'],
      rules: {
        'no-console': 'off',
      },
    },
  ],
  
  // Ignore patterns
  ignorePatterns: [
    'dist',
    'build',
    'node_modules',
    'coverage',
    '*.min.js',
  ],
};
