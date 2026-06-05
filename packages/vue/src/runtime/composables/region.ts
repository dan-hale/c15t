import { getRegionFromHeaders } from '@c15t/utils';
import { type ComputedRef, computed } from 'vue';
import { useRequestHeaders } from '#c15t/stub';

export interface RequestRegion {
	countryCode: string | null;
	regionCode: string | null;
}

export function useRequestRegion(): ComputedRef<RequestRegion> {
	return computed(() => {
		const { country, region } = getRegionFromHeaders(useRequestHeaders());

		return {
			countryCode: country ?? null,
			regionCode: region ?? null,
		};
	});
}
