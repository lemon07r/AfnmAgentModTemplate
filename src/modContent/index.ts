import type { ModAPI, ModOptionsFC, RootState } from 'afnm-types';

type TemplateConfig = {
  enabled: boolean;
};

const MOD_TAG = `[${MOD_METADATA.name}]`;
const ENABLED_FLAG_KEY = `${MOD_METADATA.name}.enabled`;

let lastKnownLocation: string | null = null;

function log(message: string, ...args: unknown[]) {
  console.log(MOD_TAG, message, ...args);
}

function getSnapshot(): RootState | null {
  return window.modAPI?.getGameStateSnapshot?.() ?? null;
}

function getGlobalFlags(): Record<string, number> {
  return window.modAPI?.actions?.getGlobalFlags?.() ?? {};
}

function getConfig(): TemplateConfig {
  return {
    enabled: (getGlobalFlags()[ENABLED_FLAG_KEY] ?? 1) !== 0,
  };
}

function setEnabled(enabled: boolean): TemplateConfig {
  window.modAPI?.actions?.setGlobalFlag?.(ENABLED_FLAG_KEY, enabled ? 1 : 0);
  return getConfig();
}

function ensureDefaultConfig() {
  const flags = getGlobalFlags();
  if (flags[ENABLED_FLAG_KEY] === undefined) {
    window.modAPI?.actions?.setGlobalFlag?.(ENABLED_FLAG_KEY, 1);
  }
}

function updateLastKnownLocation(snapshot: RootState | null) {
  lastKnownLocation = snapshot?.location?.current ?? null;
}

function createTextElement(
  createElement: (...args: unknown[]) => unknown,
  type: string,
  key: string,
  text: string,
  style: Record<string, string | number> = {},
) {
  return createElement(type, { key, style }, text);
}

const TemplateOptions: ModOptionsFC = ({ api }) => {
  const ReactRuntime = window.React;

  if (
    !ReactRuntime?.createElement ||
    !ReactRuntime.useEffect ||
    !ReactRuntime.useState
  ) {
    throw new Error('React runtime unavailable for options UI');
  }

  const createElement = ReactRuntime.createElement.bind(ReactRuntime);
  const [config, setConfig] = ReactRuntime.useState<TemplateConfig>(getConfig());
  const GameButton = api.components.GameButton ?? 'button';

  ReactRuntime.useEffect(() => {
    setConfig(getConfig());
  }, []);

  const updateEnabled = (enabled: boolean) => {
    setConfig(setEnabled(enabled));
  };

  return createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        padding: '8px 4px 4px',
      },
    },
    [
      createTextElement(
        createElement,
        'div',
        'title',
        `${MOD_METADATA.name} Settings`,
        {
          fontWeight: 700,
          fontSize: '1.1rem',
        },
      ),
      createTextElement(
        createElement,
        'div',
        'body',
        'This template stores cross-save mod settings in numeric global flags and keeps read-only state access on the official snapshot path by default.',
        {
          lineHeight: 1.45,
          opacity: 0.9,
        },
      ),
      createElement(
        'div',
        {
          key: 'actions',
          style: {
            display: 'flex',
            gap: '12px',
          },
        },
        [
          createElement(
            GameButton,
            {
              key: 'enable',
              onClick: () => updateEnabled(true),
            },
            config.enabled ? 'Enabled' : 'Enable Mod',
          ),
          createElement(
            GameButton,
            {
              key: 'disable',
              onClick: () => updateEnabled(false),
            },
            config.enabled ? 'Disable Mod' : 'Disabled',
          ),
        ],
      ),
      createTextElement(
        createElement,
        'div',
        'footer',
        'Replace this options panel with your real mod settings, but keep the same global-flag persistence pattern unless the setting truly belongs in save-scoped data.',
        {
          lineHeight: 1.45,
          opacity: 0.8,
        },
      ),
    ],
  );
};

function installDebugApi() {
  window.__afnmModDebug ??= {};
  window.__afnmModDebug[MOD_METADATA.name] = {
    getMetadata: () => ({ ...MOD_METADATA }),
    getConfig,
    getLastLocation: () => lastKnownLocation,
    getSnapshot,
    logSnapshot: () => {
      log('Snapshot', getSnapshot());
    },
  };
}

function registerOptionsUi(modApi: ModAPI) {
  modApi.actions?.registerOptionsUI?.(TemplateOptions);
}

function registerSnapshotListener(modApi: ModAPI) {
  updateLastKnownLocation(modApi.getGameStateSnapshot?.() ?? null);

  modApi.subscribe?.(() => {
    updateLastKnownLocation(modApi.getGameStateSnapshot?.() ?? null);
  });
}

function install() {
  const modApi = window.modAPI;

  if (!modApi) {
    console.warn(MOD_TAG, 'ModAPI not available; template scaffold not installed.');
    return;
  }

  window.__afnmModInstalled ??= {};
  if (window.__afnmModInstalled[MOD_METADATA.name]) {
    return;
  }
  window.__afnmModInstalled[MOD_METADATA.name] = true;

  ensureDefaultConfig();
  installDebugApi();
  registerOptionsUi(modApi);
  registerSnapshotListener(modApi);

  log('Template scaffold installed.', {
    version: MOD_METADATA.version,
    gameVersion: MOD_METADATA.gameVersion,
  });
}

install();
