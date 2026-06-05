import { defu } from 'defu';
import { computed } from 'vue';
import { defineNuxtPlugin, useAppConfig, useRuntimeConfig } from '#imports';
import { consentConfigKey } from './composables/config';
import type { ConsentConfig } from './config';

export default defineNuxtPlugin((nuxtApp) => {
	const appConfig = useAppConfig();
	const runtimeConfig = useRuntimeConfig();

	nuxtApp.vueApp.provide(
		consentConfigKey,
		computed(
			() =>
				defu(
					appConfig.c15t,
					runtimeConfig.public.c15t
				) as Partial<ConsentConfig>
		)
	);
});
