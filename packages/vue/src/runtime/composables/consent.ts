import type { Consent } from '@c15t/utils';
import type { Ref } from 'vue';
import { useCookie } from '#imports';

const CONSENT_COOKIE = 'c15t:consent';

export function useConsent(): Ref<Consent> {
	return useCookie<Consent>(CONSENT_COOKIE, {
		default: () => ({
			policies: {},
			updated: null,
			categories: {},
		}),
	});
}
