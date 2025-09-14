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

  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | any,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

export {};