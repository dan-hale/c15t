import { getRegionFromHeaders } from '@c15t/utils';
import { useRequestHeaders } from '#imports';

export interface RequestRegion {
	region?: string;
	country?: string;
}

export function useRequestRegion(): RequestRegion {
	const headers = useRequestHeaders();
	const location = getRegionFromHeaders(headers);
	return location;
}
