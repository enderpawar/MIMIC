// Editor는 Chrome Extension이 아니므로 필요한 chrome API만 최소 선언
declare const chrome:
  | {
      storage: {
        local: {
          get(keys: string[], callback: (result: Record<string, unknown>) => void): void;
        };
      };
    }
  | undefined;
