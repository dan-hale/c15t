# c15t Vue/Nuxt Framework-Agnostic Module Plan

## 1. Overview

### 1.1 Purpose

This plan describes a simple architecture for building `c15t` core so it works:

- inside Nuxt/Vite (global provide via module/plugin)
- outside Nuxt/Vite in plain Vue (manual provider or direct props)
- with shared interfaces for type-safe runtime/app config via module `d.ts`

### 1.2 Design Goals

- Define one source of truth for global config interfaces
- Expose typed module-level `RuntimeConfig` and `AppConfig`
- Provide `theme`, `options`, and `components` via inject composables
- Keep `<C15T />` usable from both global inject and direct prop inputs
- Make component surfaces reusable for future framework adapters

---

## 2. Proposed Package/File Layout

```txt
packages/vue/
  src/
    module/
      types.ts
      define-c15t-module.ts
      runtime.d.ts
      app-config.d.ts
    plugins/
      nuxt.plugin.ts
      vue.plugin.ts
      vite.plugin.ts
    providers/
      injections.ts
    auto-imports/
      unplugin-auto-imports.ts
    components/
      C15T.vue
      ConsentDialog.vue
      ConsentBanner.vue
      ConsentWidget.vue
      ConsentLink.vue
      ConsentTrigger.vue
      ConsentPreferencesLink.vue
```

---

## 3. Global Config Interfaces

### 3.1 Source-of-Truth Types

```ts
// src/module/types.ts
import type { Component } from 'vue';

export type C15TTheme = {
  colors?: {
    bg?: string;
    fg?: string;
    accent?: string;
    muted?: string;
    border?: string;
  };
  slots?: {
    dialog?: string;
    banner?: string;
    widget?: string;
    link?: string;
    trigger?: string;
    preferencesLink?: string;
  };
};

export type C15TOptions = {
  apiKey?: string;
  backendUrl?: string;
  mode?: 'auto' | 'gdpr' | 'ccpa';
  debug?: boolean;
};

export type C15TComponents = {
  ConsentDialog?: Component;
  ConsentBanner?: Component;
  ConsentWidget?: Component;
  ConsentLink?: Component;
  ConsentTrigger?: Component;
  ConsentPreferencesLink?: Component;
};

export type C15TGlobalConfig = {
  options?: C15TOptions;
  theme?: C15TTheme;
  components?: C15TComponents;
};
```

---

## 4. Injections + Provider

### 4.1 Single Injections File (keys + wrappers + strict errors)

```ts
// src/providers/injections.ts
import { inject, unref, type InjectionKey, type MaybeRef } from 'vue';
import type {
  C15TTheme,
  C15TOptions,
  C15TComponents,
} from '../module/types';

export const C15T_THEME_KEY = Symbol('c15t.theme') as InjectionKey<MaybeRef<C15TTheme>>;
export const C15T_OPTIONS_KEY = Symbol('c15t.options') as InjectionKey<C15TOptions>;
export const C15T_COMPONENTS_KEY = Symbol('c15t.components') as InjectionKey<C15TComponents>;

export function useC15TTheme() {
  const value = inject(C15T_THEME_KEY);
  if (!value) {
    throw new Error('[c15t] Missing theme injection. Configure a plugin or provide values manually.');
  }
  return unref(value);
}

export function useC15TOptions() {
  const value = inject(C15T_OPTIONS_KEY);
  if (!value) {
    throw new Error('[c15t] Missing options injection. Configure a plugin or provide values manually.');
  }
  return value;
}

export function useC15TComponents() {
  const value = inject(C15T_COMPONENTS_KEY);
  if (!value) {
    throw new Error('[c15t] Missing components injection. Configure a plugin or provide values manually.');
  }
  return value;
}
```

---

## 5. Module + Plugin Entries

### 5.1 Nuxt Module Definition

```ts
// src/module/define-c15t-module.ts
import { defineNuxtModule, addPlugin, createResolver } from '@nuxt/kit';
import type { C15TGlobalConfig } from './types';

export default defineNuxtModule<C15TGlobalConfig>({
  meta: {
    name: '@c15t/nuxt',
    configKey: 'c15t',
  },
  defaults: {
    options: {},
    theme: {},
    components: {},
  },
  setup(_moduleOptions, _nuxt) {
    const { resolve } = createResolver(import.meta.url);

    addPlugin({
      src: resolve('../plugins/nuxt.plugin'),
      mode: 'client',
    });
  },
});
```

### 5.2 Nuxt Plugin

```ts
// src/plugins/nuxt.plugin.ts
import { defineNuxtPlugin, useRuntimeConfig, useAppConfig } from '#app';
import { computed } from 'vue';
import {
  C15T_THEME_KEY,
  C15T_OPTIONS_KEY,
  C15T_COMPONENTS_KEY,
} from '../providers/injections';

export default defineNuxtPlugin((nuxtApp) => {
  const app = nuxtApp.vueApp;
  const runtime = useRuntimeConfig();
  const appConfig = useAppConfig();

  const options = {
    apiKey: runtime.public.c15t.apiKey,
    backendUrl: runtime.public.c15t.backendURL,
  };

  // Keep theme reactive to app.config.ts updates.
  const theme = computed(() => appConfig.c15t?.theme ?? {});
  const components = runtime.public.c15t.components ?? {};

  app.provide(C15T_OPTIONS_KEY, options);
  app.provide(C15T_THEME_KEY, theme);
  app.provide(C15T_COMPONENTS_KEY, components);
});
```

### 5.3 Plain Vue Plugin

```ts
// src/plugins/vue.plugin.ts
import type { App, Plugin } from 'vue';
import {
  C15T_THEME_KEY,
  C15T_OPTIONS_KEY,
  C15T_COMPONENTS_KEY,
} from '../providers/injections';
import type { C15TGlobalConfig } from '../module/types';

export function createC15TVuePlugin(config: C15TGlobalConfig): Plugin {
  return {
    install(app: App) {
      app.provide(C15T_THEME_KEY, config.theme ?? {});
      app.provide(C15T_OPTIONS_KEY, config.options ?? {});
      app.provide(C15T_COMPONENTS_KEY, config.components ?? {});
    },
  };
}
```

### 5.4 Vite Plugin (helper for direct Vue usage)

```ts
// src/plugins/vite.plugin.ts
import type { Plugin } from 'vite';
import type { C15TGlobalConfig } from '../module/types';

export function c15tVitePlugin(_config: C15TGlobalConfig): Plugin {
  return {
    name: 'c15t-vite-plugin',
    config() {
      return {
        define: {
          __C15T_VITE__: true,
        },
      };
    },
  };
}
```

### 5.5 Unplugin Auto Imports

```ts
// src/auto-imports/unplugin-auto-imports.ts
import AutoImport from 'unplugin-auto-import/vite';

export function c15tAutoImports() {
  return AutoImport({
    imports: [],
    dts: true,
    dirs: [],
    vueTemplate: true,
    resolvers: [],
  });
}
```

---

## 6. `<C15T />` Root API Design

### 6.1 Component Expectations

- Accepts `theme`, `options`, and `components` as props
- Uses strict inject composables when props are omitted
- Props override injected values when provided

### 6.2 Demo Shape

```vue
<!-- src/components/C15T.vue -->
<script setup lang="ts">
import { computed } from 'vue';
import {
  useC15TTheme,
  useC15TOptions,
  useC15TComponents,
} from '../providers/injections';
import type {
  C15TTheme,
  C15TOptions,
  C15TComponents,
} from '../module/types';

const props = defineProps<{
  theme?: C15TTheme;
  options?: C15TOptions;
  components?: C15TComponents;
}>();

const injectedTheme = useC15TTheme();
const injectedOptions = useC15TOptions();
const injectedComponents = useC15TComponents();

const theme = computed(() => props.theme ?? injectedTheme);
const options = computed(() => props.options ?? injectedOptions);
const components = computed(() => props.components ?? injectedComponents);
</script>

<template>
  <div>
    <component
      :is="components.ConsentBanner"
      v-bind="{ theme, options, components }"
    />
  </div>
</template>
```

### 6.3 Unified Usage Signature

```vue
<C15T :theme="theme" :options="options" :components="components" />
```

---

## 7. Nuxt `d.ts` Typing Strategy

### 7.1 RuntimeConfig Typing (API key, backend URL, components)

```ts
// src/module/runtime.d.ts
import type { C15TComponents } from './types';

declare module 'nuxt/schema' {
  interface RuntimeConfig {
    c15t?: {
      apiKey?: string;
      backendURL?: string;
      components?: C15TComponents;
    };
  }

  interface PublicRuntimeConfig {
    c15t?: {
      apiKey?: string;
      backendURL?: string;
      components?: C15TComponents;
    };
  }
}

export {};
```

### 7.2 AppConfig Typing (Theme colors + slots)

```ts
// src/module/app-config.d.ts
import type { C15TTheme } from './types';

declare module 'nuxt/schema' {
  interface AppConfigInput {
    c15t?: {
      theme?: C15TTheme;
    };
  }

  interface AppConfig {
    c15t?: {
      theme?: C15TTheme;
    };
  }
}

export {};
```

---

## 8. Component Set (Reka UI-based)

### 8.1 Planned components

- `ConsentDialog`
- `ConsentBanner`
- `ConsentWidget`
- `ConsentLink`
- `ConsentTrigger`
- `ConsentPreferencesLink`

### 8.2 Common resolution rule per component

Each component resolves in this order:

1. local props (`theme`, `options`, `components`)
2. strict injected values (`useC15TTheme`, `useC15TOptions`, `useC15TComponents`)
3. component-level defaults (only for optional visual values)

### 8.3 Demo component skeleton

```vue
<script setup lang="ts">
const props = defineProps<{
  theme?: unknown;
  options?: unknown;
  components?: unknown;
}>();

// Resolve props first.
// If missing, read injected values (which throw if setup is missing).
// Apply local defaults for optional style/layout only.
</script>

<template>
  <div>...</div>
</template>
```

---

## 9. Nuxt Demo Usage

### 9.1 `nuxt.config.ts` example

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  runtimeConfig: {
    public: {
      c15t: {
        apiKey: process.env.C15T_API_KEY,
        backendURL: process.env.C15T_BACKEND_URL,
        components: {},
      },
    },
  },
});
```

### 9.2 `app.config.ts` example (reactive theme source)

```ts
// app.config.ts
export default defineAppConfig({
  c15t: {
    theme: {
      colors: {
        accent: '#6ea8fe',
      },
    },
  },
});
```

### 9.3 App usage

```vue
<script setup lang="ts">
const theme = {
  colors: {
    bg: '#0b0c0f',
    fg: '#ffffff',
    accent: '#6ea8fe',
  },
  slots: {
    banner: 'rounded-xl p-4',
  },
};

const options = {
  mode: 'gdpr',
  debug: true,
};
</script>

<template>
  <C15T :theme="theme" :options="options" />
</template>
```

---

## 10. Plain Vue + Vite Demo Usage

### 10.1 Plain Vue plugin install

```ts
import { createApp } from 'vue';
import App from './App.vue';
import { createC15TVuePlugin } from '@c15t/vue/plugins/vue.plugin';

const app = createApp(App);
app.use(
  createC15TVuePlugin({
    options: {
      apiKey: 'local-dev-key',
      backendUrl: 'https://api.example.com',
    },
    theme: {
      colors: {
        accent: '#22c55e',
      },
    },
  })
);
app.mount('#app');
```

### 10.2 Vite config with c15t plugin + auto imports

```ts
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { c15tVitePlugin } from '@c15t/vue/plugins/vite.plugin';
import { c15tAutoImports } from '@c15t/vue/auto-imports/unplugin-auto-imports';

export default defineConfig({
  plugins: [vue(), c15tVitePlugin({}), c15tAutoImports()],
});
```

### 10.3 Direct props without plugin

```vue
<template>
  <C15T :theme="theme" :options="options" :components="components" />
</template>
```

---

## 11. Why This Architecture Is Framework-Agnostic

- Core behavior depends on Vue DI and typed config contracts
- Nuxt layer only bootstraps values; components stay portable
- Same component API supports global inject and manual props
- Plain Vue plugin, Vite plugin, and unplugin auto imports support non-Nuxt flows
- Manual `app.provide(...)` setup can be documented without a dedicated helper provider

---

## 12. Next Implementation Steps

### 12.1 Initial build order

1. Add `types.ts` and `d.ts` contracts
2. Add `injections.ts` with strict inject wrappers
3. Add Nuxt plugin + plain Vue plugin + Vite plugin
4. Add unplugin auto imports configuration
5. Add `<C15T />` strict resolution behavior
6. Add/port Reka UI components

### 12.2 Validation checklist

- Nuxt app renders with module install and config
- Plain Vue app renders with `createC15TVuePlugin()`
- Vite app works with `c15tVitePlugin()` and auto imports plugin
- Direct `<C15T :theme :options :components />` path works
- Missing injection setup path throws clear errors