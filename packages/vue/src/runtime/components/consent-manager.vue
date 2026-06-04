<script setup lang="ts">
import { ref, watch } from 'vue';
import widgetStyles from '@c15t/styles/consent-widget.module.css';
import { initConsentView } from '../utils/init-consent-view';
import {
	useConsentActiveUI,
	useConsentConfig,
	useConsentInit,
	useConsentSelection,
} from '#c15t/composables';
import ConsentAccordion from './consent-accordion.vue';
import ConsentAccordionItem from './consent-accordion-item.vue';
import ConsentPolicyFooter from './consent-policy-footer.vue';
import ConsentSwitch from './consent-switch.vue';

const init = useConsentInit();
const selection = useConsentSelection();
const activeUI = useConsentActiveUI();
const config = useConsentConfig();

const openItem = ref<string>('');
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
	() => activeUI.value === 'dialog',
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
		data-testid="consent-manager-root"
		:class="widgetStyles.widget"
	>
		<ConsentAccordion v-model="openItem" type="single">
			<ConsentAccordionItem
				v-for="category in consentState.categories"
				:key="category"
				:value="category"
				:disabled="isCategoryDisabled(category)"
			>
				<template #trigger>
					<div :class="widgetStyles.accordionTrigger">
						<div :class="widgetStyles.accordionTriggerInner">
							<span :class="widgetStyles.accordionTitle">
								{{ consentTitle(category) }}
							</span>
						</div>
						<div :class="widgetStyles.switch">
							<ConsentSwitch
								:model-value="draft.includes(category)"
								:disabled="isCategoryDisabled(category)"
								:data-testid="`consent-widget-switch-${category}`"
								@update:model-value="
									(value) => toggleCategory(category, Boolean(value))
								"
							/>
						</div>
					</div>
				</template>
				<div :class="widgetStyles.accordionContent">
					{{ consentDescription(category) }}
				</div>
			</ConsentAccordionItem>
		</ConsentAccordion>

		<ConsentPolicyFooter surface="dialog" @save="savePreferences" />
	</div>
</template>
