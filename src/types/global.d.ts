// Global type declarations for test environment

declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        generateTestEmail: () => string;
        generateTestId: (prefix: string) => string;
        wait: (ms: number) => Promise<void>;
      };
    }
  }

  var testUtils: {
    generateTestEmail: () => string;
    generateTestId: (prefix: string) => string;
    wait: (ms: number) => Promise<void>;
  };
}

export {};