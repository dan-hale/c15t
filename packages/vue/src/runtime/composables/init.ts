import type { InitOutput } from '@c15t/schema/types';
import { computed, type Ref } from 'vue';
import { useFetch } from '#c15t/stub';
import { useConsentConfig } from './config';
import { useConsentLanguage } from './language';
import { useRequestRegion } from './region';

export function useConsentInit(): Ref<InitOutput | null> {
	const config = useConsentConfig();
	const language = useConsentLanguage();
	const region = useRequestRegion();
	const query = computed(() => ({
		country:
			config.value.location?.countryCode ??
			region.value.countryCode ??
			undefined,
		region:
			config.value.location?.regionCode ?? region.value.regionCode ?? undefined,
		language: language.value,
	}));

	return useFetch<InitOutput>('/init', {
		baseURL: computed(() => config.value.backendURL ?? undefined),
		query,
		immediate: true,
	}).data;
}
