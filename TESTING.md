# Testing Setup for Qualitative Analysis Application

This project includes a comprehensive testing setup with both unit tests and end-to-end tests.

## Test Structure

### Unit Tests (`tests/unit/`)
- Test individual service functions
- Located in `/tests/unit/` directory
- Files follow pattern: `*.test.ts`
- Uses Jest and ts-jest for TypeScript support

### End-to-End Tests (`tests/e2e/`)
- Full user workflow tests
- Located in `/tests/e2e/` directory
- Files follow pattern: `*.test.ts`
- Uses Playwright for browser automation

## Available Test Scripts

```bash
# Run unit tests only
npm test

# Run end-to-end tests only
npm run test:ui

# Run end-to-end tests in debug mode (opens browser)
npm run test:debug

# Generate and view Playwright test report
npm run test:report
```

## Unit Tests Coverage

The unit tests cover:
- Open Coding Service functions
- Axial Coding Service functions
- Selective Coding Service functions
- Saturation Analysis Service
- Code Comparison Service
- NLP Processing Service
- All core business logic functions

## End-to-End Tests Coverage

The E2E tests cover:
- App Flow and Navigation
- Open Coding Step functionality
- Axial Coding Step functionality
- Selective Coding Step functionality
- Project Management features
- Search functionality
- Export functionality
- Visualization features
- User Preferences system
- Keyboard Shortcuts
- Responsive design

## Test Configuration

### Jest Configuration
- Located in `jest.config.js`
- Excludes E2E tests from unit test runs
- Uses ts-jest for TypeScript support
- Runs in Node environment

### Playwright Configuration
- Located in `playwright.config.ts`
- Tests the application across multiple browsers (Chromium, Firefox, WebKit)
- Includes automatic web server startup for testing
- Includes trace and video recording for debugging

## Running Tests Locally

To run tests locally:

1. Ensure dependencies are installed:
   ```bash
   npm install
   ```

2. Install Playwright browsers:
   ```bash
   npx playwright install
   ```

3. Run unit tests:
   ```bash
   npm test
   ```

4. Run E2E tests (requires the app to be running):
   ```bash
   # Start the app in one terminal
   npm run dev
   
   # Then run tests in another terminal
   npm run test:ui
   ```