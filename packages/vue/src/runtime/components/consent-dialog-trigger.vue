<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import {
	useDraggable,
	useMounted,
	useStorage,
	useWindowSize,
} from '@vueuse/core';
import type {
	ConsentDialogTriggerPosition,
	ConsentDialogTriggerSize,
} from '@c15t/config';
import triggerStyles from '@c15t/styles/consent-dialog-trigger.module.css';
import {
	useConsentActiveUI,
	useConsentConfig,
	useConsentInit,
	useConsentIabSelection,
	useConsentSelection,
} from '#c15t/composables';

const activeUI = useConsentActiveUI();
const config = useConsentConfig();
const init = useConsentInit();
const selection = useConsentSelection();
const iabSelection = useConsentIabSelection();

const STORAGE_KEY = 'c15t:dialog-trigger-position';
const STORAGE_OFFSET = 20;

const mounted = useMounted();
const { width, height } = useWindowSize();
const triggerRef = ref<HTMLElement | null>(null);
const persistedPosition = useStorage<{ x: number; y: number } | null>(
	STORAGE_KEY,
	null,
);

function resolveSizePixels(size: ConsentDialogTriggerSize): number {
	if (size === 'sm') {
		return 32;
	}
	if (size === 'lg') {
		return 48;
	}
	return 40;
}

function resolveInitialPosition(
	position: ConsentDialogTriggerPosition,
	size: ConsentDialogTriggerSize,
) {
	const sizePixels = resolveSizePixels(size);
	const maxX = Math.max(width.value - sizePixels - STORAGE_OFFSET, STORAGE_OFFSET);
	const maxY = Math.max(height.value - sizePixels - STORAGE_OFFSET, STORAGE_OFFSET);
	if (position === 'top-left') {
		return { x: STORAGE_OFFSET, y: STORAGE_OFFSET };
	}
	if (position === 'top-right') {
		return { x: maxX, y: STORAGE_OFFSET };
	}
	if (position === 'bottom-left') {
		return { x: STORAGE_OFFSET, y: maxY };
	}
	return { x: maxX, y: maxY };
}

const initialValue = computed(() =>
	persistedPosition.value ??
	resolveInitialPosition(
		config.value.triggerDefaultPosition,
		config.value.triggerSize,
	),
);

const { x, y, style, isDragging } = useDraggable(triggerRef, {
	initialValue: initialValue.value,
	onEnd: (position) => {
		if (!config.value.triggerPersistPosition) {
			return;
		}

		persistedPosition.value = { x: position.x, y: position.y };
	},
	preventDefault: true,
	stopPropagation: true,
});

watch(
	[mounted, width, height],
	() => {
		if (!mounted.value || isDragging.value) {
			return;
		}
		if (persistedPosition.value) {
			return;
		}

		const next = resolveInitialPosition(
			config.value.triggerDefaultPosition,
			config.value.triggerSize,
		);
		x.value = next.x;
		y.value = next.y;
	},
	{ immediate: true },
);

function hasIabConsent(): boolean {
	const state = iabSelection.value;
	return Object.values(state.vendorConsents).some(Boolean);
}

const hasConsented = computed(() => {
	if (init.value?.policy?.model === 'iab') {
		return hasIabConsent();
	}

	return selection.value.length > 0;
});

const isVisible = computed(() => {
	if (!mounted.value) {
		return false;
	}
	if (config.value.triggerShowWhen === 'never') {
		return false;
	}
	if (config.value.triggerShowWhen === 'after-consent') {
		return hasConsented.value;
	}
	return true;
});

const sizeClass = computed(() => {
	if (config.value.triggerSize === 'sm') {
		return triggerStyles.sm;
	}
	if (config.value.triggerSize === 'lg') {
		return triggerStyles.lg;
	}
	return triggerStyles.md;
});

const triggerClass = computed(() => {
	const classes = [triggerStyles.trigger, sizeClass.value];
	if (isDragging.value) {
		classes.push(triggerStyles.dragging);
	}
	return classes;
});

const triggerStyle = computed(() => ({
	position: 'fixed',
	zIndex: 9999,
	...(style.value as Record<string, unknown>),
}));

function openDialog() {
	activeUI.value = 'dialog';
}
</script>

<template>
	<button
		v-if="isVisible"
		ref="triggerRef"
		type="button"
		data-testid="consent-dialog-trigger"
		:class="triggerClass"
		:style="triggerStyle"
		:aria-label="config.triggerAriaLabel"
		@click="openDialog"
	>
		<span :class="triggerStyles.icon" aria-hidden="true">
			<svg
				v-if="config.triggerIcon === 'fingerprint'"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M12 12a4 4 0 0 0-4 4" />
				<path d="M12 8a8 8 0 0 0-8 8" />
				<path d="M12 4a12 12 0 0 0-12 12" />
				<path d="M12 12a4 4 0 0 1 4 4" />
				<path d="M12 8a8 8 0 0 1 8 8" />
				<path d="M12 4a12 12 0 0 1 12 12" />
			</svg>
			<svg
				v-else-if="config.triggerIcon === 'settings'"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<circle cx="12" cy="12" r="3" />
				<path
					d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65
					1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65
					0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65
					1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0
					0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65
					1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65
					0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65
					1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65
					0 0 0-1.51 1z"
				/>
			</svg>
			<svg
				v-else
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
			>
				<path d="M4 12h16" />
				<path d="M4 6h16" />
				<path d="M4 18h16" />
			</svg>
		</span>
	</button>
</template>
