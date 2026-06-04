/**
 * Vue stubs are the contract; `#imports` must satisfy them.
 */
import type { useCookie as useCookieVue } from './composables/stubs/cookie';
import type { useFetch as useFetchVue } from './composables/stubs/fetch';
import type { useRequestHeaders as useRequestHeadersVue } from './composables/stubs/requestHeaders';
import type { useState as useStateVue } from './composables/stubs/state';

type AssertNuxtExtendsVue<N, V> = N extends V ? true : never;

type _fetch = AssertNuxtExtendsVue<
	typeof import('#imports').useFetch,
	typeof useFetchVue
>;
type _cookie = AssertNuxtExtendsVue<
	typeof import('#imports').useCookie,
	typeof useCookieVue
>;
type _headers = AssertNuxtExtendsVue<
	typeof import('#imports').useRequestHeaders,
	typeof useRequestHeadersVue
>;
type _state = AssertNuxtExtendsVue<
	typeof import('#imports').useState,
	typeof useStateVue
>;

declare const _fetchCheck: _fetch;
declare const _cookieCheck: _cookie;
declare const _headersCheck: _headers;
declare const _stateCheck: _state;

void _fetchCheck;
void _cookieCheck;
void _headersCheck;
void _stateCheck;
