<script setup lang="ts">
import {
	AccordionContent,
	AccordionHeader,
	AccordionItem,
	AccordionTrigger,
} from 'reka-ui';
import widgetStyles from '@c15t/styles/consent-widget.module.css';
import { useConsentConfig } from '#c15t/composables';

defineProps<{
	value: string;
	disabled?: boolean;
}>();

const config = useConsentConfig();
</script>

<template>
	<AccordionItem
		:value="value"
		:disabled="disabled"
		v-bind="config.components?.['accordion-item']?.root"
		data-testid="consent-accordion-item"
		:class="widgetStyles.accordionItem"
	>
		<AccordionHeader>
			<AccordionTrigger
				v-bind="config.components?.['accordion-item']?.trigger"
				:class="widgetStyles.accordionTriggerInner"
			>
				<slot name="trigger" />
			</AccordionTrigger>
		</AccordionHeader>
		<AccordionContent
			v-bind="config.components?.['accordion-item']?.content"
			:class="widgetStyles.accordionContent"
		>
			<slot />
		</AccordionContent>
	</AccordionItem>
</template>
