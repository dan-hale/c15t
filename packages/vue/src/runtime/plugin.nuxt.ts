import { defu } from 'defu';
import { computed, provide } from 'vue';
import { defineNuxtPlugin, useAppConfig, useRuntimeConfig } from '#imports';
import { consentConfigKey } from './composables/config';
import type { ConsentConfig } from './config';

export default defineNuxtPlugin(() => {
	const appConfig = useAppConfig();
	const runtimeConfig = useRuntimeConfig();

	provide(
		consentConfigKey,
		computed(
			() =>
				defu(
					runtimeConfig.public.c15t,
					appConfig.c15t
				) as Partial<ConsentConfig>
		)
	);
});
