import { parsePrimaryLanguage } from '@c15t/utils';
import { computed, type Ref } from 'vue';
import { useCookie, useRequestHeaders } from '#imports';

export function useConsentLanguage(): Ref<string | undefined> {
	const stored = useCookie<string | null>('c15t:language');

	return computed({
		get: () => {
			const headers = useRequestHeaders();
			const accept = headers['accept-language'] ?? headers['Accept-Language'];
			const languageFromHeader = parsePrimaryLanguage(accept);

			return (
				stored.value ||
				globalThis.navigator?.language ||
				languageFromHeader ||
				undefined
			);
		},
		set: (value) => {
			stored.value = value ?? null;
		},
	});
}
