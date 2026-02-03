# HYOW Testing Suite Documentation

This document explains the complete testing infrastructure for HoldYourOwnBrand. After setup, you'll have pre-commit hooks that catch errors before they leave your machine, plus GitHub Actions that serve as a safety net before deployment.

## Table of Contents

1. [Quick Start](#quick-start)
2. [How It Works](#how-it-works)
3. [Running Tests](#running-tests)
4. [Writing Tests](#writing-tests)
5. [Pre-Commit Hooks](#pre-commit-hooks)
6. [GitHub Actions CI](#github-actions-ci)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

After copying all the configuration files to your project, run these commands:

```bash
# From your HoldYourOwnBrand root directory
cd client

# Run all tests once
npm test -- --run

# Run tests in watch mode (re-runs on file changes)
npm test

# Run tests with coverage report
npm run test:coverage

# Run ESLint
npm run lint
```

---

## How It Works

The testing system has three layers of protection:

### Layer 1: Your Editor (Immediate Feedback)
If you have ESLint integrated with VS Code, you'll see red squiggles under problems as you type.

### Layer 2: Pre-Commit Hooks (Before Code Leaves Your Machine)
When you run `git commit`, Husky intercepts and runs lint-staged, which:
1. Checks JavaScript syntax with `node --check`
2. Runs ESLint on staged files
3. Runs tests related to changed files

If any check fails, the commit is blocked.

### Layer 3: GitHub Actions (Before Deployment)
Even if someone bypasses local hooks (with `--no-verify`), GitHub Actions runs the full test suite. With branch protection rules, failed checks prevent merging.

```
You write code
     ↓
ESLint in editor catches obvious errors
     ↓
git commit
     ↓
Husky runs pre-commit hook
     ↓
lint-staged runs ESLint + tests on staged files
     ↓
✅ Pass → Commit proceeds
❌ Fail → Commit blocked, you fix the issue
     ↓
git push
     ↓
GitHub Actions runs full test suite
     ↓
✅ Pass → Vercel/Railway deploy
❌ Fail → PR blocked until fixed
```

---

## Running Tests

### Basic Commands

```bash
# Run all tests once and exit
npm test -- --run

# Run tests in watch mode (recommended during development)
npm test

# Run a specific test file
npm test -- AccountPage

# Run tests matching a pattern
npm test -- --grep "logout"

# Run tests with verbose output
npm test -- --reporter=verbose

# Run tests with coverage
npm run test:coverage

# Open the Vitest UI (visual test runner)
npm run test:ui
```

### Understanding Test Output

When you run tests, you'll see output like this:

```
 ✓ src/pages/__tests__/AccountPage.test.jsx (15 tests) 234ms
   ✓ AccountPage
     ✓ Authentication Redirect
       ✓ redirects to login page when user is not authenticated
       ✓ shows loading state when checking authentication
     ✓ Authenticated User View
       ✓ displays the page title
       ✓ displays user email
       ...
```

A green checkmark (✓) means the test passed. A red X (✗) means it failed, and you'll see details about what went wrong.

---

## Writing Tests

### Test File Location

Tests should be placed near the code they test:

```
client/src/
├── pages/
│   ├── AccountPage.jsx
│   └── __tests__/
│       └── AccountPage.test.jsx    ← Tests for AccountPage
├── components/
│   ├── Button.jsx
│   └── __tests__/
│       └── Button.test.jsx         ← Tests for Button
├── store/
│   ├── cartStore.js
│   └── __tests__/
│       └── cartStore.test.js       ← Tests for cartStore
```

### Basic Test Structure

```jsx
// Import testing utilities
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import the component to test
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  // Setup that runs before each test
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // Group related tests
  describe('when user is logged in', () => {
    it('displays welcome message', () => {
      // Arrange: Set up the test
      render(<MyComponent user={{ name: 'John' }} />);
      
      // Assert: Check the result
      expect(screen.getByText('Welcome, John')).toBeInTheDocument();
    });
  });

  // Test user interactions
  it('calls onSubmit when form is submitted', async () => {
    // Arrange
    const mockOnSubmit = vi.fn();
    const user = userEvent.setup();
    render(<MyComponent onSubmit={mockOnSubmit} />);
    
    // Act: Simulate user actions
    await user.type(screen.getByLabelText('Email'), 'test@example.com');
    await user.click(screen.getByRole('button', { name: 'Submit' }));
    
    // Assert
    expect(mockOnSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
  });
});
```

### Common Testing Patterns

#### Testing Components with Router

```jsx
import { BrowserRouter } from 'react-router-dom';

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

it('renders with router', () => {
  renderWithRouter(<MyPage />);
  expect(screen.getByText('Home')).toBeInTheDocument();
});
```

#### Mocking API Calls

```jsx
beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    })
  );
});

it('fetches data on mount', async () => {
  render(<MyComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('test')).toBeInTheDocument();
  });
});
```

#### Mocking Zustand Stores

```jsx
vi.mock('@/store/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '123', name: 'Test User' },
    isAuthenticated: true,
    logout: vi.fn(),
  }),
}));
```

### What to Test

**DO test:**
- User interactions (clicks, typing, form submission)
- Conditional rendering (shows X when Y is true)
- Error states
- Loading states
- Integration between components

**DON'T test:**
- Implementation details (internal state, private methods)
- Third-party libraries (they have their own tests)
- Styling/CSS (use visual regression tools for that)

---

## Pre-Commit Hooks

### How They Work

When you run `git commit`:

1. **Husky** intercepts the commit
2. **lint-staged** runs commands only on files you're committing
3. If all checks pass, the commit proceeds
4. If any check fails, the commit is blocked

### What Gets Checked

| File Type | Checks |
|-----------|--------|
| `client/src/**/*.{js,jsx}` | ESLint + related tests |
| `server/src/**/*.js` | Node syntax check + ESLint |
| `**/*.json` | JSON syntax validation |

### Bypassing Hooks (Use Sparingly!)

If you absolutely need to commit without checks:

```bash
git commit --no-verify -m "emergency fix"
```

**Warning:** This bypasses all checks. The GitHub Actions will still run, so broken code won't reach production, but it's better to fix issues locally.

### Troubleshooting Pre-Commit

**Hook not running?**
```bash
# Reinstall Husky
npx husky install
chmod +x .husky/pre-commit
```

**ESLint errors blocking commit?**
```bash
# See all errors
npm run lint

# Auto-fix what can be fixed
npm run lint:fix
```

---

## GitHub Actions CI

### What Runs

The CI workflow (`.github/workflows/ci.yml`) runs on every push and pull request to `main` and `develop` branches.

| Job | What It Does |
|-----|--------------|
| `client-tests` | Runs ESLint and Vitest on frontend |
| `server-tests` | Checks syntax of all server JS files |
| `build-check` | Ensures the app builds successfully |

### Setting Up Branch Protection

To require CI to pass before merging:

1. Go to your GitHub repo → Settings → Branches
2. Add a branch protection rule for `main`
3. Check "Require status checks to pass before merging"
4. Select "CI Success" as a required check

### Viewing CI Results

1. Go to your GitHub repo → Actions tab
2. Click on a workflow run to see details
3. Expand any job to see individual step output

---

## Troubleshooting

### "Cannot find module" errors in tests

This usually means a path alias isn't configured. Check that `vitest.config.js` has the same aliases as your `vite.config.js`:

```js
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
},
```

### Tests pass locally but fail in CI

Check for:
- Environment variables (CI might not have the same `.env`)
- Time-dependent tests (different timezones)
- Order-dependent tests (tests shouldn't depend on each other)

### ESLint "no-undef" errors for `describe`, `it`, `expect`

Add Vitest globals to your ESLint config:

```js
// .eslintrc.cjs
overrides: [
  {
    files: ['**/*.test.{js,jsx}'],
    env: {
      'vitest-globals/env': true,
    },
  },
],
```

### Tests are slow

```bash
# Run only related tests
npm test -- --changed

# Run tests in parallel
npm test -- --pool=threads
```

---

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm test` | Run tests in watch mode |
| `npm test -- --run` | Run tests once |
| `npm run test:coverage` | Run tests with coverage |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix auto-fixable ESLint issues |
| `git commit` | Commit (runs pre-commit checks) |
| `git commit --no-verify` | Commit without checks (use sparingly) |

---

## Need Help?

If you run into issues:

1. Check the error message carefully - it usually tells you exactly what's wrong
2. Run `npm run lint` to see all linting issues
3. Run `npm test -- --run` to see all test failures
4. Check that all dependencies are installed: `npm install`

Happy testing! 🐾
