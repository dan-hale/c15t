<script setup lang="ts">
import { computed } from 'vue';
import type { PolicyUiAction } from '@c15t/schema/types';
import {
	getCookieSelectionForAction,
	getPolicySurfaceState,
	type PolicySurface,
} from '../utils/policySurface';
import bannerStyles from '@c15t/styles/consent-banner.module.css';
import widgetStyles from '@c15t/styles/consent-widget.module.css';
import {
	useConsentActiveUI,
	useConsentConfig,
	useConsentInit,
	useConsentSelection,
} from '#c15t/composables';
import ConsentButton from './consent-button.vue';

const props = defineProps<{
	surface: PolicySurface;
}>();

const emit = defineEmits<{
	save: [];
}>();

const init = useConsentInit();
const selection = useConsentSelection();
const activeUI = useConsentActiveUI();
const config = useConsentConfig();

const styles = computed(() =>
	props.surface === 'banner' ? bannerStyles : widgetStyles
);

const footerState = computed(() =>
	getPolicySurfaceState(init.value ?? undefined, props.surface)
);

const footerClasses = computed(() => {
	const classes = [styles.value.footer];
	if (footerState.value.shouldFillActions) {
		classes.push(styles.value.footerFill);
	}
	if (footerState.value.direction === 'column') {
		classes.push(styles.value.footerColumn);
	}
	return classes;
});

function subGroupClasses() {
	const classes = [styles.value.footerSubGroup];
	if (footerState.value.shouldFillActions) {
		classes.push(styles.value.footerSubGroupFill);
	}
	if (footerState.value.direction === 'column') {
		classes.push(styles.value.footerSubGroupColumn);
	}
	return classes;
}

function actionButtonClass(action: PolicyUiAction) {
	const classes: string[] = [];
	if (footerState.value.shouldFillActions) {
		classes.push(styles.value.actionButtonFill);
	}
	if (props.surface === 'banner') {
		if (action === 'accept') {
			classes.push(bannerStyles.acceptButton);
		}
		if (action === 'reject') {
			classes.push(bannerStyles.rejectButton);
		}
		if (action === 'customize') {
			classes.push(bannerStyles.customizeButton);
		}
	}
	return classes;
}

function isPrimaryAction(action: PolicyUiAction) {
	return footerState.value.primaryActions.includes(action);
}

function actionLabel(action: PolicyUiAction) {
	const common = init.value?.translations?.translations?.common;
	if (action === 'accept') {
		return common?.acceptAll ?? 'Accept all';
	}
	if (action === 'reject') {
		return common?.rejectAll ?? 'Reject all';
	}
	if (props.surface === 'banner') {
		return common?.customize ?? 'Customize';
	}
	return common?.save ?? 'Save';
}

function actionTestId(action: PolicyUiAction) {
	if (props.surface === 'banner') {
		if (action === 'accept') {
			return 'consent-banner-accept-button';
		}
		if (action === 'reject') {
			return 'consent-banner-reject-button';
		}
		return 'consent-banner-customize-button';
	}
	if (action === 'accept') {
		return 'consent-widget-footer-accept-button';
	}
	if (action === 'reject') {
		return 'consent-widget-reject-button';
	}
	return 'consent-widget-footer-save-button';
}

function onAction(action: PolicyUiAction) {
	if (action === 'customize' && props.surface === 'banner') {
		activeUI.value = 'manager';
		return;
	}
	if (action === 'customize') {
		emit('save');
		activeUI.value = null;
		return;
	}
	if (!init.value) {
		return;
	}
	if (action === 'accept') {
		selection.value = getCookieSelectionForAction(init, 'all');
		activeUI.value = null;
		return;
	}
	if (action === 'reject') {
		selection.value = getCookieSelectionForAction(init, 'necessary');
		activeUI.value = null;
	}
}

const footerBind = computed(() =>
	props.surface === 'banner'
		? config.value.components?.banner?.footer
		: config.value.components?.manager?.footer
);

const footerSubGroupBind = computed(() =>
	props.surface === 'banner'
		? config.value.components?.banner?.footerSubGroup
		: config.value.components?.manager?.footerSubGroup
);
</script>

<template>
	<div
		v-bind="footerBind"
		:data-testid="
			surface === 'banner' ? 'consent-banner-footer' : 'consent-widget-footer'
		"
		:class="footerClasses"
	>
		<div
			v-for="(group, groupIndex) in footerState.actionGroups"
			:key="`group-${group.join('-') || groupIndex}`"
			v-bind="footerSubGroupBind"
			:class="subGroupClasses()"
		>
			<ConsentButton
				v-for="action in group"
				:key="action"
				:variant="isPrimaryAction(action) ? 'primary' : 'neutral'"
				:mode="action === 'customize' && surface === 'dialog' ? 'ghost' : action === 'reject' ? 'stroke' : 'filled'"
				:class="actionButtonClass(action)"
				:data-testid="actionTestId(action)"
				@click="onAction(action)"
			>
				{{ actionLabel(action) }}
			</ConsentButton>
		</div>
	</div>
</template>
