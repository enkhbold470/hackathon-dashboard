// Import Jest DOM extensions
require('@testing-library/jest-dom');

// Mock the next/navigation module
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock the Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  auth: jest.fn(() => ({ userId: 'test-user-id' })),
  currentUser: jest.fn(() => Promise.resolve({ id: 'test-user-id' })),
  clerkClient: {
    users: {
      getUser: jest.fn(() => Promise.resolve({ id: 'test-user-id' })),
    },
  },
  SignedIn: jest.fn(({ children }) => children),
  SignedOut: jest.fn(({ children }) => children),
}));

// Mock fetch API
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    status: 200,
  })
); 