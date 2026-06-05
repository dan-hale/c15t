<script setup lang="ts">
import { ref, watch } from 'vue';
import {
	AccordionContent,
	AccordionHeader,
	AccordionItem,
	AccordionRoot,
	AccordionTrigger,
} from 'reka-ui';
import accordionStyles from '@c15t/styles/accordion.module.css';
import widgetStyles from '@c15t/styles/consent-widget.module.css';
import { initConsentView } from '../utils/init-consent-view';
import {
	useConsentActiveUI,
	useConsentConfig,
	useConsentInit,
	useConsentSelection,
} from '#c15t/composables';
import ConsentPolicyFooter from './consent-policy-footer.vue';
import ConsentSwitch from './consent-switch.vue';

const init = useConsentInit();
const selection = useConsentSelection();
const activeUI = useConsentActiveUI();
const config = useConsentConfig();

const draft = ref<string[]>([]);

const consentState = initConsentView(init);

function syncDraft() {
	if (!init.value) {
		return;
	}

	if (selection.value.length > 0) {
		draft.value = [...selection.value];
		return;
	}

	draft.value = [...consentState.value.preselected];
}

watch(
	() => activeUI.value === 'manager',
	(open) => {
		if (open) {
			syncDraft();
		}
	},
	{ immediate: true },
);

function consentTitle(category: string) {
	const title = consentState.value.types[category]?.title;
	if (title) {
		return title;
	}

	return category
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (character) => character.toUpperCase());
}

function consentDescription(category: string) {
	return consentState.value.types[category]?.description;
}

function isCategoryDisabled(category: string) {
	return category === 'necessary';
}

function toggleCategory(category: string, enabled: boolean) {
	if (enabled) {
		if (!draft.value.includes(category)) {
			draft.value.push(category);
		}
		return;
	}

	const index = draft.value.indexOf(category);
	if (index >= 0) {
		draft.value.splice(index, 1);
	}
}

function savePreferences() {
	selection.value = [...draft.value];
	activeUI.value = null;
}
</script>

<template>
	<div
		v-bind="config.components?.manager?.root"
		data-testid="consent-widget-root"
		:class="[
			widgetStyles.widget,
			{ 'disable-animation': config.value?.disableAnimation },
		]"
	>
		<AccordionRoot
			v-bind="config.components?.accordion?.root"
			type="single"
			collapsible
			:unmount-on-hide="false"
			data-testid="consent-widget-accordion"
			:class="accordionStyles.list"
		>
			<AccordionItem
				v-for="category in consentState.categories"
				:key="category"
				:value="category"
				v-bind="config.components?.['accordion-item']?.root"
				:data-testid="`consent-widget-accordion-item-${category}`"
				:unmount-on-hide="false"
				:class="accordionStyles.item"
			>
				<AccordionHeader
					:class="accordionStyles.itemHeader"
					:data-testid="`consent-widget-accordion-trigger-${category}`"
				>
					<AccordionTrigger
						v-bind="config.components?.['accordion-item']?.trigger"
						:data-testid="`consent-widget-accordion-trigger-inner-${category}`"
						:class="accordionStyles.trigger"
					>
						<span
							:class="accordionStyles.arrow"
							:data-testid="`consent-widget-accordion-arrow-${category}`"
							aria-hidden="true"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
							>
								<path d="M5 12h14M12 5v14" />
							</svg>
						</span>
						<span :class="accordionStyles.header">
							<span :class="accordionStyles.title">
								{{ consentTitle(category) }}
							</span>
						</span>
					</AccordionTrigger>
				</AccordionHeader>
				<div :class="accordionStyles.control">
					<ConsentSwitch
						size="small"
						:model-value="draft.includes(category)"
						:disabled="isCategoryDisabled(category)"
						:aria-label="consentTitle(category)"
						:data-testid="`consent-widget-switch-${category}`"
						@update:model-value="
							(value) => toggleCategory(category, Boolean(value))
						"
					/>
				</div>
				<AccordionContent
					v-bind="config.components?.['accordion-item']?.content"
					:data-testid="`consent-widget-accordion-content-${category}`"
					:class="accordionStyles.content"
				>
					<div :class="accordionStyles.contentViewport">
						<div :class="accordionStyles.contentInner">
							{{ consentDescription(category) }}
						</div>
					</div>
				</AccordionContent>
			</AccordionItem>
		</AccordionRoot>

		<ConsentPolicyFooter surface="dialog" @save="savePreferences" />
	</div>
</template>
