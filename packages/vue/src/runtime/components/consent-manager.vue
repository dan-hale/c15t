<script
	setup
	lang="ts"
>
import accordionStyles from '@c15t/styles/accordion.module.css';
import widgetStyles from '@c15t/styles/consent-widget.module.css';
import {
	AccordionContent,
	AccordionHeader,
	AccordionItem,
	AccordionRoot,
	AccordionTrigger,
} from 'reka-ui';
import { type HTMLAttributes, reactive } from 'vue';
import {
	useConsent,
	useConsentActiveUI,
	useConsentConfig,
	useConsentInit,
} from '../composables';
import ConsentSwitch from './consent-switch.vue';
import ConsentWidgetFooter from './consent-widget-footer.vue';

const init = useConsentInit();
const consent = useConsent();
const activeUI = useConsentActiveUI();
const config = useConsentConfig();

const draft = reactive<string[]>([]);

function consentTitle(category: string) {
	const types = init.value?.translations?.translations?.consentTypes as
		| Record<string, { title?: string }>
		| undefined;
	const title = types?.[category]?.title;
	if (title) return title;

	return category
		.replace(/_/g, ' ')
		.replace(/\b\w/g, (character) => character.toUpperCase());
}

function toggleCategory(category: string, enabled: boolean) {
	if (enabled) {
		if (!draft.includes(category)) {
			draft.push(category);
		}
		return;
	}

	const index = draft.indexOf(category);
	if (index >= 0) {
		draft.splice(index, 1);
	}
}

function savePreferences(preference: 'all' | 'necessary' | string[]) {
	if (preference === 'all') {
		consent.value.categories = categories.map((category) => 'grant');
	} else if (preference === 'necessary') {
		consent.value.categories = categories.map((category) => 'grant');
	} else {
		consent.value.categories = preference.map((category) => 'grant');
	}

	activeUI.value = null;
}
</script>

<template>
	<div
		v-bind="config.components?.manager?.root"
		data-testid="consent-widget-root"
		:class="widgetStyles.widget"
		:data-disable-animation="config?.disableAnimation ? true : undefined"
	>
		<AccordionRoot
			v-bind="config.components?.accordion?.root as Omit<HTMLAttributes, 'dir'>"
			type="single"
			collapsible
			:unmount-on-hide="false"
			data-testid="consent-widget-accordion"
			:class="accordionStyles.list"
		>
			<AccordionItem
				v-for="category in init?.policy?.consent?.categories || ['necessary']"
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
						:disabled="category === 'necessary'"
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
							{{ ( init?.translations?.translations ?.consentTypes as Record<string,{ description?: string }>)?.[category]?.description }}
						</div>
					</div>
				</AccordionContent>
			</AccordionItem>
		</AccordionRoot>

		<ConsentWidgetFooter @save="savePreferences" />
	</div>
</template>
