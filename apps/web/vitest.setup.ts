import "@testing-library/jest-dom";

import { vi } from "vitest";

// Mock navigator.clipboard
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn(),
  },
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "mock-url");
global.URL.revokeObjectURL = vi.fn();
