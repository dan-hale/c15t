<script lang="ts" setup>
import { useConsent, useConsentActiveUI, useConsentInit, useFetch, useRequestHeaders, useConsentConfig } from '#imports';
import type { InitOutput } from '@c15t/schema/types';
import { deriveActiveConsentUi } from '@c15t/utils';
import { computed, watchEffect } from 'vue';
import ConsentBanner from './consent-banner.vue';
import ConsentDialog from './consent-dialog.vue';
import IabConsentBanner from './iab-consent-banner.vue';
import IabConsentDialog from './iab-consent-dialog.vue';

const props = defineProps<{
	region?: string
	country?: string
}>()

const config = useConsentConfig()
const init = useConsentInit()
const consent = useConsent()
const activeUI = useConsentActiveUI()

const serverHeaders = useRequestHeaders()

const headers = computed(() => {
	const headers = {...serverHeaders}
	if (props.country) headers['x-c15t-country'] = props.country
	if (props.region) headers['x-c15t-region'] = props.region
	// if (props.language) headers['x-c15t-language'] = props.language
	return headers
})

const { data } = await useFetch<InitOutput>('/init', {
	baseURL: config.value.backendURL,
	headers
})

watchEffect(() => {
	if (data.value) {
		init.value = data.value
		activeUI.value = deriveActiveConsentUi(consent.value, data.value)
	}
})

import { useHead } from '@unhead/vue';

useHead(computed(() => {
	const style = Object.entries(config.value.tokens).map(([key, value]) => `--${key}: ${String(value)};`).join(' ');
	return style ? {
				style: [
					{
						innerHTML: `:root { ${style} }`,
						id: 'c15t-css-vars',
					},
				],
			}
		: {};
}));

</script>

<template>
	<IabConsentBanner v-if="data?.gvl && activeUI === 'banner'" />
	<IabConsentDialog v-else-if="data?.gvl && activeUI === 'manager'" />
	<ConsentBanner v-else-if="!data?.gvl && activeUI === 'banner'" />
	<ConsentDialog v-else-if="!data?.gvl && activeUI === 'manager'" />
</template>
