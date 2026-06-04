<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { Teleport } from 'vue';
import { useScrollLock } from '@vueuse/core';
import bannerStyles from '@c15t/styles/consent-banner.module.css';
import {
	useConsentActiveUI,
	useConsentConfig,
	useConsentInit,
} from '#c15t/composables';
import { FocusScope } from 'reka-ui';
import ConsentDescription from './consent-description.vue';
import ConsentPolicyFooter from './consent-policy-footer.vue';
import ConsentTag from './consent-tag.vue';

const activeUI = useConsentActiveUI();
const config = useConsentConfig();
const init = useConsentInit();

const isOpen = computed(() => {
	const model = init.value?.policy?.model;
	const models = config.value.bannerModels ?? config.value.models;
	const isVisible =
		!models?.length || (model !== undefined && models.includes(model));
	return activeUI.value === 'banner' && isVisible;
});
const visible = ref(false);

const dataVisible = computed(() =>
	config.value.disableAnimation ? undefined : String(visible.value),
);

watch(
	isOpen,
	(open) => {
		if (open) {
			visible.value = true;
			return;
		}

		if (config.value.disableAnimation) {
			visible.value = false;
			return;
		}

		const duration = Number.parseInt(
			typeof document !== 'undefined'
				? getComputedStyle(document.documentElement).getPropertyValue(
						'--consent-banner-animation-duration',
					) || '200'
				: '200',
			10,
		);
		const timer = window.setTimeout(() => {
			visible.value = false;
		}, duration);
		return () => window.clearTimeout(timer);
	},
	{ immediate: true },
);

const scrollLock = computed(
	() => init.value?.policy?.ui?.banner?.scrollLock ?? false,
);

useScrollLock(computed(() => Boolean(isOpen.value && scrollLock.value)));

const shouldTrapFocus = computed(
	() => Boolean(isOpen.value && config.value.trapFocus),
);

const bannerTitle = computed(
	() => init.value?.translations?.translations?.cookieBanner?.title,
);
</script>

<template>
	<Teleport v-if="isOpen" to="body">
		<div
			v-if="scrollLock"
			v-bind="config.components?.banner?.overlay"
			data-testid="consent-banner-overlay"
			:class="bannerStyles.overlay"
			:data-visible="dataVisible"
		/>
		<div
			v-bind="config.components?.banner?.root"
			data-testid="consent-banner-root"
			:class="bannerStyles.root"
			:data-visible="dataVisible"
		>
			<div :class="bannerStyles.cardShell">
				<ConsentTag
					v-if="!(config.bannerHideBranding ?? config.hideBranding)"
					context="banner"
				/>
				<FocusScope :trapped="shouldTrapFocus" :loop="shouldTrapFocus">
					<div
						v-bind="config.components?.banner?.card"
						data-testid="consent-banner-card"
						:class="bannerStyles.card"
						:role="shouldTrapFocus ? 'dialog' : undefined"
						:aria-modal="shouldTrapFocus ? 'true' : undefined"
						:aria-label="shouldTrapFocus ? bannerTitle : undefined"
						tabindex="0"
					>
						<div
							v-bind="config.components?.banner?.header"
							:class="bannerStyles.header"
						>
							<div
								v-bind="config.components?.banner?.title"
								data-testid="consent-banner-title"
								:class="bannerStyles.title"
							>
								{{ init?.translations?.translations?.cookieBanner?.title }}
							</div>
							<ConsentDescription context="banner" />
						</div>
						<ConsentPolicyFooter surface="banner" />
					</div>
				</FocusScope>
			</div>
		</div>
	</Teleport>
</template>
