<script setup lang="ts">
import { computed, Teleport, Transition } from 'vue';
import { DEFAULT_BANNER_POSITION } from '@c15t/config';
import bannerStyles from '@c15t/styles/consent-banner.module.css';
import {
	useConsentActiveUI,
	useConsentConfig,
	useConsentInit,
} from '#c15t/composables';
import { FocusScope } from 'reka-ui';
import ConsentDescription from './consent-description.vue';
import ConsentBannerFooter from './consent-banner-footer.vue';
import ConsentTag from './consent-tag.vue';
import { useConsentScrollLock } from '../composables/use-consent-scroll-lock';

const activeUI = useConsentActiveUI();
const config = useConsentConfig();
const init = useConsentInit();

const isOpen = computed(() => {
	const model = init.value?.policy?.model;
	const models = config.value.bannerModels ?? config.value.models;
	const matchesModel =
		!models?.length || (model !== undefined && models.includes(model));
	return activeUI.value === 'banner' && matchesModel;
});

const disableAnimation = computed(() => Boolean(config.value.disableAnimation));

const scrollLock = computed(
	() => init.value?.policy?.ui?.banner?.scrollLock ?? true,
);
useConsentScrollLock(computed(() => isOpen.value && scrollLock.value));

const shouldTrapFocus = computed(
	() => Boolean(isOpen.value && config.value.trapFocus),
);

const bannerTitle = computed(
	() => init.value?.translations?.translations?.cookieBanner?.title,
);

const bannerPosition = computed(
	() => config.value.bannerPosition ?? DEFAULT_BANNER_POSITION,
);
</script>

<template>
	<Teleport to="body">
		<Transition
			:disabled="disableAnimation"
			:enter-active-class="bannerStyles.overlayEnterActive"
			:leave-active-class="bannerStyles.overlayLeaveActive"
			:enter-from-class="bannerStyles.overlayEnterFrom"
			:enter-to-class="bannerStyles.overlayEnterTo"
			:leave-from-class="bannerStyles.overlayLeaveFrom"
			:leave-to-class="bannerStyles.overlayLeaveTo"
		>
			<div
				v-if="isOpen && scrollLock"
				v-bind="config.components?.banner?.overlay"
				data-testid="consent-banner-overlay"
				:class="bannerStyles.overlay"
			/>
		</Transition>
		<Transition
			:disabled="disableAnimation"
			:enter-active-class="bannerStyles.bannerEnterActive"
			:leave-active-class="bannerStyles.bannerLeaveActive"
			:enter-from-class="bannerStyles.bannerEnterFrom"
			:enter-to-class="bannerStyles.bannerEnterTo"
			:leave-from-class="bannerStyles.bannerLeaveFrom"
			:leave-to-class="bannerStyles.bannerLeaveTo"
		>
			<div
				v-if="isOpen"
				v-bind="config.components?.banner?.root"
				data-testid="consent-banner-root"
				:data-position="bannerPosition"
				:class="bannerStyles.root"
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
							<ConsentBannerFooter />
						</div>
					</FocusScope>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>
