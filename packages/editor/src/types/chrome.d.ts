// Editor is not a Chrome extension; minimal chrome API declaration for import
declare const chrome:
  | {
      storage: {
        local: {
          get(keys: string[], callback: (result: Record<string, unknown>) => void): void;
        };
      };
    }
  | undefined;
