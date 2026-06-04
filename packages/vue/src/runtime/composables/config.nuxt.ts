import { defaultConsentConfig } from '@c15t/config';
import { defu } from 'defu';
import { type ComputedRef, computed } from 'vue';
import type { ConsentConfig } from '#c15t/config';
import { useAppConfig, useRuntimeConfig } from '#imports';

export function useConsentConfig(): ComputedRef<ConsentConfig> {
	const runtimeConfig = useRuntimeConfig();
	const appConfig = useAppConfig();

	return computed(
		() =>
			defu(
				defaultConsentConfig,
				appConfig.c15t as Partial<ConsentConfig> | undefined,
				runtimeConfig.public.c15t as Partial<ConsentConfig>
			) as ConsentConfig
	);
}
