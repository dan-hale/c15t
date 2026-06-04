declare module '#c15t/stub' {
	export {
		useCookie,
		useFetch,
		useRequestHeaders,
		useState,
		type C15tUseFetchOptions,
		type C15tUseFetchReturn,
		type ConsentConfig,
		type SearchParams,
		type UseStateInit,
	} from './runtime/stub.vue.ts';
}

declare module '#c15t/config' {
	export type { ConsentConfig } from './runtime/config.vue.ts';
}

declare module '#c15t/composables' {
	export * from './index.ts';
}
