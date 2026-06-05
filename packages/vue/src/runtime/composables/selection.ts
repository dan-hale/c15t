import { computed, type Ref } from 'vue';
import { useCookie } from '#imports';

const SELECTION_COOKIE = 'c15t:selection';

export function useConsentSelection(): Ref<string[]> {
	const stored = useCookie<string[]>(SELECTION_COOKIE, {
		default: () => [],
	});

	return computed({
		get: () => stored.value ?? [],
		set: (value) => {
			stored.value = value;
		},
	});
}
