import type { ModAPI, RootState } from 'afnm-types';

type TemplateConfig = {
  enabled: boolean;
};

type TemplateDebugApi = {
  getMetadata: () => {
    name: string;
    version: string;
    author: { name: string };
    description: string;
    gameVersion?: string;
  };
  getConfig: () => TemplateConfig;
  getLastLocation: () => string | null;
  getSnapshot: () => RootState | null;
  logSnapshot: () => void;
};

declare global {
  const MOD_METADATA: {
    name: string;
    version: string;
    author: { name: string };
    description: string;
    gameVersion?: string;
  };

  interface Window {
    modAPI?: ModAPI;
    React?: {
      createElement: (...args: any[]) => any;
      useEffect?: (
        effect: () => void | (() => void),
        deps?: readonly unknown[],
      ) => void;
      useState?: <T>(
        initialState: T,
      ) => [T, (value: T | ((previousValue: T) => T)) => void];
    };
    __afnmModInstalled?: Record<string, boolean>;
    __afnmModDebug?: Record<string, TemplateDebugApi>;
  }
}

export {};
