import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
import React from 'react';

// Mock server-only (used in some lib files)
vi.mock('server-only', () => ({}));

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

// Mock next/image — React.createElement to avoid JSX in .ts
vi.mock('next/image', () => ({
  default: vi.fn().mockImplementation((props: Record<string, unknown>) => {
    const { fill, priority, ...rest } = props;
    return React.createElement('img', rest);
  }),
}));

// Mock next/link
vi.mock('next/link', () => ({
  default: vi.fn().mockImplementation(({ children, ...rest }: { children: React.ReactNode; href: string }) => {
    return React.createElement('a', rest, children);
  }),
}));
