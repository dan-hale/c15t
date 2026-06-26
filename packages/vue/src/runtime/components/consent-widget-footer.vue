<script setup lang="ts" >
import type { PolicyUiAction, PolicyUiActionGroup } from '@c15t/schema/types';
import widgetStyles from '@c15t/styles/consent-widget.module.css';
import {
	getConsentAvailableCategories,
	type CONSENT_CATEGORY,
} from '@c15t/utils';
import {
	useConsent,
	useConsentActiveUI,
	useConsentConfig,
	useConsentInit,
} from '#c15t/composables';
import ConsentButton from './consent-button.vue';

const emit = defineEmits<{
	save: [];
}>();

const activeUI = useConsentActiveUI();
const config = useConsentConfig();
const consent = useConsent();
const init = useConsentInit();

const DEFAULT_ACTIONS: PolicyUiAction[] = ['reject', 'accept', 'customize'];

function surface() {
	return init.value?.policy?.ui?.dialog;
}

function actionGroups(): PolicyUiAction[][] {
	const layout = surface()?.layout;
	if (layout && layout.length > 0) {
		return layout.map((group: PolicyUiActionGroup) => {
			if (Array.isArray(group)) {
				return group;
			}
			return [group];
		});
	}

	const allowed = surface()?.allowedActions;
	if (allowed && allowed.length > 0) {
		return [allowed];
	}

	return [DEFAULT_ACTIONS];
}

function direction() {
	const value = surface()?.direction;
	if (value === 'column') {
		return 'column';
	}
	return 'row';
}

function shouldFill() {
	const uiProfile = surface()?.uiProfile ?? 'compact';
	const groups = actionGroups();
	const actionCount = new Set(groups.flat()).size;
	const isSplitLayout = groups.length > 1;
	const isColumn = direction() === 'column';

	if (uiProfile === 'strict') {
		return true;
	}
	if (uiProfile === 'balanced' && actionCount <= 2) {
		return true;
	}
	if (
		uiProfile === 'balanced' &&
		actionCount === 3 &&
		(isSplitLayout || isColumn)
	) {
		return true;
	}
	return false;
}

function isPrimary(action: PolicyUiAction) {
	const primaries = surface()?.primaryActions;
	if (primaries && primaries.length > 0) {
		return primaries.includes(action);
	}

	const ordered = actionGroups().flat();
	if (ordered.includes('customize')) {
		return action === 'customize';
	}
	return false;
}

function buttonMode(action: PolicyUiAction) {
	if (action === 'reject') {
		return 'stroke';
	}
	return 'filled';
}

function actionLabel(action: PolicyUiAction) {
	const common = init.value?.translations?.translations?.common;
	if (action === 'accept') {
		return common?.acceptAll ?? 'Accept all';
	}
	if (action === 'reject') {
		return common?.rejectAll ?? 'Reject all';
	}
	return common?.save ?? 'Save';
}

function actionTestId(action: PolicyUiAction) {
	if (action === 'accept') {
		return 'consent-widget-footer-accept-button';
	}
	if (action === 'reject') {
		return 'consent-widget-reject-button';
	}
	return 'consent-widget-footer-save-button';
}

function setAllCategories(granted: boolean) {
	const categories = getConsentAvailableCategories(
		init.value,
		config.value.consentCategories,
	);
	const next = {} as Record<CONSENT_CATEGORY, boolean>;
	for (const category of categories) {
		next[category] = category === 'necessary' || granted;
	}
	consent.value = next;
	activeUI.value = null;
}

function onAction(action: PolicyUiAction) {
	if (action === 'customize') {
		emit('save');
		return;
	}
	if (!init.value) {
		return;
	}
	if (action === 'accept') {
		setAllCategories(true);
		return;
	}
	if (action === 'reject') {
		setAllCategories(false);
	}
}
</script>

<template>
	<div
		v-bind="config.components?.manager?.footer"
		data-testid="consent-widget-footer"
		:class="widgetStyles.footer"
		:data-direction="direction()"
		:data-fill="shouldFill() ? true : undefined"
	>
		<div
			v-for="(group, groupIndex) in actionGroups()"
			:key="`group-${group.join('-') || groupIndex}`"
			v-bind="config.components?.manager?.footer"
			data-testid="consent-widget-footer-sub-group"
			:class="widgetStyles.footerSubGroup"
			:data-direction="direction()"
			:data-fill="shouldFill() ? true : undefined"
		>
			<ConsentButton
				v-for="action in group"
				:key="action"
				:variant="isPrimary(action) ? 'primary' : 'neutral'"
				:mode="buttonMode(action)"
				:data-action="action"
				:data-testid="actionTestId(action)"
				@click="onAction(action)"
			>
				{{ actionLabel(action) }}
			</ConsentButton>
		</div>
	</div>
</template>
