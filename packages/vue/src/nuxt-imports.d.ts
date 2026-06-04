declare module '#imports' {
	export function useFetch<T>(
		url: import('vue').MaybeRefOrGetter<string | null>,
		options?: import('./runtime/composables/useFetch.vue').C15tUseFetchOptions
	): import('./runtime/composables/useFetch.vue').C15tUseFetchReturn<T>;
	export function useCookie<T>(
		name: string,
		options?: import('./runtime/composables/useCookie.vue').C15tCookieOptions<T>
	): import('vue').Ref<T | null>;
	export function useRuntimeConfig(): {
		public: Record<string, unknown>;
	};
	export function useAppConfig(): Record<string, unknown>;
	export function useRequestHeaders(
		...args: unknown[]
	): Record<string, string | undefined>;
	export function useState<T>(
		key: string,
		init: import('./runtime/composables/useState.d').UseStateInit<T>
	): import('vue').Ref<T>;
	export function defineNuxtPlugin(
		plugin: (nuxtApp?: unknown) => void | Record<string, unknown>
	): unknown;
}
