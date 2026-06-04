import type { InitOutput } from '@c15t/schema/types';
import { type ComputedRef, computed, type MaybeRef, toValue } from 'vue';

interface InitConsentView {
	categories: string[];
	preselected: string[];
	necessary: string[];
	types: Record<
		string,
		{
			title?: string;
			description?: string;
		}
	>;
}

const DEFAULT_CATEGORIES = ['necessary'] as const;

export function initConsentView(
	init: MaybeRef<InitOutput | null | undefined>
): ComputedRef<InitConsentView> {
	return computed(() => {
		const output = toValue(init);
		if (!output)
			return {
				categories: [],
				preselected: [],
				necessary: [],
				types: {},
			};

		const types = output.translations.translations.consentTypes ?? {};
		const policyCategories = output.policy?.consent?.categories;
		const categories =
			policyCategories && policyCategories.length > 0
				? policyCategories
				: [...DEFAULT_CATEGORIES];
		const preselected = (
			output.policy?.consent?.preselectedCategories ?? []
		).filter((category) => categories.includes(category));
		const necessary = categories.filter((category) => category === 'necessary');

		return { categories, preselected, necessary, types };
	});
}
