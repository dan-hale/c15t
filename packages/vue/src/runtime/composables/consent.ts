import { type Consent, interpretStoredConsent } from '@c15t/utils';
import { computed, customRef } from 'vue';
import { useConsentInit, useCookie } from '#imports';

const CONSENT_COOKIE = 'c15t:consent';

export function useStoredConsent() {
	return useCookie<Consent>(CONSENT_COOKIE, {
		default: () => ({
			policies: {},
			categories: {},
		}),
	});
}

export function useConsent() {
	const stored = useStoredConsent();
	const init = useConsentInit();

	return customRef((track, trigger) => ({
		get() {
			track();
			return stored.value.categories;
		},
		set(value) {
			stored.value.categories = value;
			if (!init.value) throw new Error('Consent init not found');
			if (!init.value.policy) throw new Error('Consent policy not found');
			if (!init.value.policyDecision)
				throw new Error('Consent policy decision not found');
			stored.value.policies[init.value.policy.id] = {
				fingerprint: init.value.policyDecision.fingerprint,
				timestamp: Date.now().toString(),
			};
			trigger();
		},
	}));
}

export function useHasConsent() {
	const stored = useStoredConsent();
	const init = useConsentInit();
	return computed(() => {
		if (!init.value) return [];
		if (!stored.value) return [];
		return interpretStoredConsent(stored.value, init.value);
	});
}
