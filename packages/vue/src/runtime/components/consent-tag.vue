<script setup lang="ts">
import { computed } from 'vue';
import dialogStyles from '@c15t/styles/consent-dialog.module.css';
import widgetStyles from '@c15t/styles/consent-widget.module.css';
import { useConsentConfig, useConsentInit } from '#c15t/composables';

const props = defineProps<{
	context: 'banner' | 'dialog' | 'manager' | 'iab-banner' | 'iab-dialog';
}>();

const init = useConsentInit();
const config = useConsentConfig();

const branding = computed(() => init.value?.branding ?? 'c15t');

const moduleClass = computed(() => {
	if (props.context === 'dialog' || props.context === 'iab-dialog') {
		return dialogStyles.brandingTagDialog;
	}
	if (props.context === 'manager') {
		return widgetStyles.brandingLink;
	}
	if (props.context === 'iab-banner') {
		return dialogStyles.brandingTagBanner;
	}
	return dialogStyles.brandingTagBanner;
});

const href = computed(() =>
	branding.value === 'inth' || branding.value === 'consent'
		? 'https://inth.com'
		: 'https://c15t.com',
);
</script>

<template>
	<a
		v-bind="config.components?.tag?.[context]"
		:href="href"
		target="_blank"
		rel="noopener noreferrer"
		data-testid="consent-tag"
		:class="moduleClass"
	>
		<slot>c15t</slot>
	</a>
</template>
