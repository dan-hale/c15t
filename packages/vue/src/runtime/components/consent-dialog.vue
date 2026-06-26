<script
	setup
	lang="ts"
>
import { DEFAULT_MANAGER_MODE } from '@c15t/config';
import dialogStyles from '@c15t/styles/consent-dialog.module.css';
import {
	DialogContent,
	DialogOverlay,
	DialogPortal,
	DialogRoot,
} from 'reka-ui';
import { computed, Teleport } from 'vue';
import {
	useConsentActiveUI,
	useConsentConfig,
	useConsentInit,
} from '#c15t/composables';
import { useConsentScrollLock } from '../composables/use-consent-scroll-lock';
import ConsentDescription from './consent-description.vue';
import ConsentDialogTrigger from './consent-dialog-trigger.vue';
import ConsentManager from './consent-manager.vue';
import ConsentTag from './consent-tag.vue';

const activeUI = useConsentActiveUI();
const config = useConsentConfig();
const init = useConsentInit();

const isOpen = computed(() => {
	// const model = init.value?.policy?.model;
	// const models = config.value.dialogModels ?? config.value.models;
	// const isVisible =
	// 	!models?.length || (model !== undefined && models.includes(model));
	return activeUI.value === 'manager';
});

const disableAnimation = computed(() => Boolean(config.value.disableAnimation));

function onOpenChange(open: boolean) {
	if (!open) {
		activeUI.value = null;
	}
}

const scrollLock = computed(
	() => init.value?.policy?.ui?.dialog?.scrollLock ?? true
);

const shouldTrapFocus = computed(() =>
	Boolean(isOpen.value && config.value.trapFocus)
);

useConsentScrollLock(computed(() => isOpen.value && scrollLock.value));
</script>

<template>
	<DialogRoot
		:open="true"
		:modal="shouldTrapFocus"
		@update:open="onOpenChange"
	>
		<DialogPortal>
			<DialogOverlay
				v-if="scrollLock"
				v-bind="config.components?.dialog?.overlay"
				data-testid="consent-dialog-overlay"
				:class="dialogStyles.overlay"
				:data-disable-animation="disableAnimation ? true : undefined"
			/>
			<DialogContent
				v-bind="config.components?.dialog?.root"
				data-testid="consent-dialog-root"
				data-mode="dialog"
				:class="dialogStyles.root"
				:data-disable-animation="disableAnimation ? true : undefined"
			>
				<div :class="dialogStyles.container">
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
								{{ init?.translations?.translations?.consentManagerDialog?.title }}
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
							v-if="!(config.dialogHideBranding ?? config.hideBranding)"
						>
							<ConsentTag
								context="dialog"
							/>
						</div>
					</div>
				</div>
			</DialogContent>
		</DialogPortal>
	</DialogRoot>
</template>
<!-- <Teleport v-else to="body">
	<div
		v-if="isOpen"
		v-bind="config.components?.dialog?.root"
		data-testid="consent-manager-sidebar-root"
		:data-mode="managerMode"
		data-state="open"
		:class="[
			dialogStyles.root,
			{ 'disable-animation': disableAnimation },
		]"
	>
			<div
				v-if="scrollLock"
				v-bind="config.components?.dialog?.overlay"
				data-testid="consent-manager-sidebar-overlay"
				:class="dialogStyles.overlay"
				@click="onOpenChange(false)"
			/>
			<div :class="dialogStyles.container">
				<div
					v-bind="config.components?.dialog?.card"
					data-testid="consent-manager-sidebar-card"
					:class="dialogStyles.card"
				>
					<div
						v-bind="config.components?.dialog?.header"
						:class="dialogStyles.header"
					>
						<div
							v-bind="config.components?.dialog?.title"
							data-testid="consent-manager-sidebar-title"
							:class="dialogStyles.title"
						>
							{{
								init?.translations?.translations?.consentManagerDialog
									?.title
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
							v-if="
								!(config.dialogHideBranding ?? config.hideBranding)
							"
							context="dialog"
						/>
					</div>
				</div>
			</div>
		</div>
</Teleport> -->
