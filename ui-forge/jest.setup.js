import '@testing-library/jest-dom';

// Mock environment variables
process.env.HF_TOKEN = 'test-token';
process.env.NEXTAUTH_SECRET = 'test-secret';
process.env.NEXTAUTH_URL = 'http://localhost:3000';

// Mock console.log to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  // Keep warn and error for debugging
  warn: console.warn,
  error: console.error,
};
