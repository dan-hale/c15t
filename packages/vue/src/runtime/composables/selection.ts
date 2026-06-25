import { interpretStoredConsent } from '@c15t/utils';
import { type ComputedRef, computed, inject } from 'vue';

import { symbolConsent, symbolInit } from '../utils/symbols';

export async function useConsentSelection(): Promise<ComputedRef<string[]>> {
	const init = inject(symbolInit);
	const consent = inject(symbolConsent);

	return computed(() =>
		consent?.value && init?.value
			? interpretStoredConsent(consent.value, init.value)
			: []
	);
}
