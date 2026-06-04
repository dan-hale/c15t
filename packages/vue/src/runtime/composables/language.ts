import { computed, type Ref } from 'vue';
import { useCookie, useRequestHeaders } from '#c15t/stub';

export function useConsentLanguage(): Ref<string | undefined> {
	const stored = useCookie<string>('c15t:language');

	return computed({
		get: () => {
			const headers = useRequestHeaders();
			const accept = headers['accept-language'] ?? headers['Accept-Language'];
			const languageFromHeader = accept?.split(',')[0]?.split(';')[0]?.trim();

			return (
				stored.value ||
				globalThis.navigator?.language ||
				languageFromHeader ||
				undefined
			);
		},
		set: (value) => {
			stored.value = value;
		},
	});
}
