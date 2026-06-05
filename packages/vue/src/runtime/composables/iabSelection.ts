import { computed, type Ref } from 'vue';
import { useCookie } from '#imports';

export type IabPreferenceTab = 'purposes' | 'vendors';

export interface ConsentIabSelection {
	purposeConsents: Record<number, boolean>;
	purposeLegitimateInterests: Record<number, boolean>;
	vendorConsents: Record<string, boolean>;
	vendorLegitimateInterests: Record<string, boolean>;
	specialFeatureOptIns: Record<number, boolean>;
	preferenceCenterTab: IabPreferenceTab;
}

export function createDefaultIabSelection(): ConsentIabSelection {
	return {
		purposeConsents: {},
		purposeLegitimateInterests: {},
		vendorConsents: {},
		vendorLegitimateInterests: {},
		specialFeatureOptIns: {},
		preferenceCenterTab: 'purposes',
	};
}

const IAB_SELECTION_COOKIE = 'c15t:iab-selection';

export function useConsentIabSelection(): Ref<ConsentIabSelection> {
	const stored = useCookie<ConsentIabSelection>(IAB_SELECTION_COOKIE, {
		default: createDefaultIabSelection,
	});

	return computed({
		get: () => stored.value ?? createDefaultIabSelection(),
		set: (value) => {
			stored.value = value;
		},
	});
}
