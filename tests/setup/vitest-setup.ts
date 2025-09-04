import { vi, afterAll } from 'vitest';
import * as dotenv from 'dotenv';

// Load test environment variables
dotenv.config({ path: '.env.test' });

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  useSearchParams: () => ({
    get: vi.fn(),
  }),
  usePathname: () => '/test-path',
}));

// Mock Next.js headers
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: vi.fn(),
    set: vi.fn(),
    delete: vi.fn(),
  }),
  headers: () => ({
    get: vi.fn(),
  }),
}));

// Set up global test environment variables
process.env.NEXT_PUBLIC_CREEM_TEST_MODE = 'true';
process.env.NEXT_PUBLIC_CREEM_PUBLIC_KEY = 'pk_test_mock';
process.env.CREEM_SECRET_KEY = 'sk_test_mock';
process.env.CREEM_WEBHOOK_SECRET = 'whsec_test_mock';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test_anon_key';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'test_service_role_key';

// Global test utilities
global.testUtils = {
  generateTestEmail: () => `test-${Date.now()}@example.com`,
  generateTestId: (prefix: string) => `${prefix}_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  wait: (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
};

// Clean up after all tests
afterAll(() => {
  vi.clearAllMocks();
  vi.resetAllMocks();
});