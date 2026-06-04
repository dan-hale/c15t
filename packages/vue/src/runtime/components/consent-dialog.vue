<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
	DialogContent,
	DialogOverlay,
	DialogPortal,
	DialogRoot,
} from 'reka-ui';
import dialogStyles from '@c15t/styles/consent-dialog.module.css';
import {
	useConsentActiveUI,
	useConsentConfig,
	useConsentInit,
} from '#c15t/composables';
import ConsentDescription from './consent-description.vue';
import ConsentDialogTrigger from './consent-dialog-trigger.vue';
import ConsentManager from './consent-manager.vue';
import ConsentTag from './consent-tag.vue';

const activeUI = useConsentActiveUI();
const config = useConsentConfig();
const init = useConsentInit();

const isOpen = computed(() => {
	const model = init.value?.policy?.model;
	const models = config.value.dialogModels ?? config.value.models;
	const isVisible =
		!models?.length || (model !== undefined && models.includes(model));
	return activeUI.value === 'dialog' && isVisible;
});
const visible = ref(false);

const dataVisible = computed(() =>
	config.value.disableAnimation ? undefined : String(visible.value),
);

watch(isOpen, (open) => {
	if (open) {
		visible.value = true;
		return;
	}

	if (config.value.disableAnimation) {
		visible.value = false;
	}
});

function onOpenChange(open: boolean) {
	if (!open) {
		activeUI.value = null;
	}
}

const scrollLock = computed(
	() => init.value?.policy?.ui?.dialog?.scrollLock ?? true,
);

const shouldTrapFocus = computed(
	() => Boolean(isOpen.value && config.value.trapFocus),
);
</script>

<template>
	<ConsentDialogTrigger
		v-if="config.dialogShowTrigger ?? config.showTrigger"
	/>
	<DialogRoot :open="isOpen" :modal="shouldTrapFocus" @update:open="onOpenChange">
		<DialogPortal>
			<DialogOverlay
				v-if="scrollLock"
				v-bind="config.components?.dialog?.overlay"
				data-testid="consent-dialog-overlay"
				:class="dialogStyles.overlay"
				:data-visible="dataVisible"
			/>
			<DialogContent
				v-bind="config.components?.dialog?.root"
				data-testid="consent-dialog-root"
				:class="dialogStyles.root"
				:data-visible="dataVisible"
			>
				<div
					v-bind="config.components?.dialog?.card"
					data-testid="consent-dialog-card"
					:class="dialogStyles.card"
				>
					<div
						v-bind="config.components?.dialog?.header"
						:class="dialogStyles.header"
					>
						<div
							v-bind="config.components?.dialog?.title"
							data-testid="consent-dialog-title"
							:class="dialogStyles.title"
						>
							{{
								init?.translations?.translations?.consentManagerDialog?.title
							}}
						</div>
						<ConsentDescription context="dialog" />
					</div>
					<div
						v-bind="config.components?.dialog?.content"
						:class="dialogStyles.content"
					>
						<ConsentManager />
					</div>
					<div
						v-bind="config.components?.dialog?.footer"
						:class="dialogStyles.footer"
					>
						<ConsentTag
							v-if="!(config.dialogHideBranding ?? config.hideBranding)"
							context="dialog"
						/>
					</div>
				</div>
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>
