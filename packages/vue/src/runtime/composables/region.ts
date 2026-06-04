import { type ComputedRef, computed } from 'vue';
import { useRequestHeaders } from '#c15t/stub';

export interface RequestRegion {
	countryCode: string | null;
	regionCode: string | null;
}

const COUNTRY_PRIORITY = [
	'cf-ipcountry',
	'x-vercel-ip-country',
	'x-amz-cf-ipcountry',
	'x-country-code',
] as const;

const REGION_PRIORITY = [
	'x-vercel-ip-country-region',
	'x-region-code',
] as const;

function normalizeHeader(value: string | string[] | undefined): string | null {
	if (!value) {
		return null;
	}

	if (Array.isArray(value)) {
		return value[0] ?? null;
	}

	return value;
}

function parseRequestRegionFromHeaders(
	headers: Record<string, string | undefined>
): RequestRegion {
	let countryCode: string | null = null;
	for (const name of COUNTRY_PRIORITY) {
		const value = normalizeHeader(headers[name]);
		if (value) {
			countryCode = value;
			break;
		}
	}

	let regionCode: string | null = null;
	for (const name of REGION_PRIORITY) {
		const value = normalizeHeader(headers[name]);
		if (value) {
			regionCode = value;
			break;
		}
	}

	return { countryCode, regionCode };
}

export function useRequestRegion(): ComputedRef<RequestRegion> {
	return computed(() => parseRequestRegionFromHeaders(useRequestHeaders()));
}
