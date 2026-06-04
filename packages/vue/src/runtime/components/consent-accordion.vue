<script setup lang="ts">
import { AccordionRoot } from 'reka-ui';
import widgetStyles from '@c15t/styles/consent-widget.module.css';
import { useConsentConfig } from '#c15t/composables';

withDefaults(
	defineProps<{
		type?: 'single' | 'multiple';
	}>(),
	{
		type: 'multiple',
	},
);

const model = defineModel<string | string[]>();

const config = useConsentConfig();
</script>

<template>
	<AccordionRoot
		v-model="model"
		v-bind="config.components?.accordion?.root"
		:type="type"
		data-testid="consent-accordion"
		:class="widgetStyles.accordionList"
	>
		<slot />
	</AccordionRoot>
</template>
