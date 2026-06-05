declare module '#c15t/stub' {
	export {
		useCookie,
		useFetch,
		useRequestHeaders,
		useState,
		type C15tUseFetchOptions,
		type C15tUseFetchReturn,
		type SearchParams,
		type UseStateInit,
	} from './runtime/stub.vue.ts';
}

declare module '#c15t/composables' {
	export {
		consentConfigKey,
		useConsentConfig,
	} from './runtime/composables/config';
	export { useConsentActiveUI } from './runtime/composables/activeUI';
	export { useConsentComponent } from './runtime/composables/component';
	export {
		createDefaultIabSelection,
		useConsentIabSelection,
		type ConsentIabSelection,
	} from './runtime/composables/iabSelection';
	export { useConsentInit } from './runtime/composables/init';
	export { useConsentLanguage } from './runtime/composables/language';
	export { useRequestRegion } from './runtime/composables/region';
	export { useConsentSelection } from './runtime/composables/selection';
}
