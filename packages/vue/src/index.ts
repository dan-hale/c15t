import type { App, Plugin } from 'vue';
import type { ConsentConfig } from './config.vue';
import { consentConfigKey } from './runtime/composables/config';

export type * from '@c15t/config';
export type { ConsentConfig as VueConsentConfig } from './config.vue';
export * from './runtime/composables/activeUI';
export * from './runtime/composables/component';
export * from './runtime/composables/config';
export * from './runtime/composables/iabSelection';
export * from './runtime/composables/init';
export * from './runtime/composables/language';
export * from './runtime/composables/region';
export * from './runtime/composables/selection';

export const c15tVue: Plugin<[Partial<ConsentConfig>?]> = {
	install(app: App, options?: Partial<ConsentConfig>) {
		if (options) {
			app.provide(consentConfigKey, options);
		}
	},
};
