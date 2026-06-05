import type { InitOutput } from '@c15t/schema/types';
import { computed, type Ref } from 'vue';
import { useFetch, useRequestHeaders } from '#imports';
import { useConsentConfig } from './config';
import { useConsentLanguage } from './language';
import { useRequestRegion } from './region';

export function useConsentInit(): Ref<InitOutput | null> {
	const config = useConsentConfig();
	const language = useConsentLanguage();
	const { region, country } = useRequestRegion();
	const query = computed(() => ({
		regionCode: region,
		countryCode: country,
		language: language.value,
	}));

	console.log(query.value);

	const { data } = useFetch<InitOutput>('/init', {
		baseURL: config.value.backendURL,
		query,
		headers: useRequestHeaders(),
	});

	return computed(() => data.value ?? null);
}
