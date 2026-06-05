<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import type { GlobalVendorList, NonIABVendor } from '@c15t/schema/types';
import { initConsentView } from '../utils/init-consent-view';
import {
	useConsentActiveUI,
	useConsentIabSelection,
	type ConsentIabSelection,
	useConsentInit,
	useConsentSelection,
	useConsentConfig,
} from '#c15t/composables';
import ConsentBanner from './consent-banner.vue';
import ConsentDialog from './consent-dialog.vue';
import IabConsentBanner from './iab-consent-banner.vue';
import IabConsentDialog from './iab-consent-dialog.vue';

function buildDefaultIabSelection(
	gvl: GlobalVendorList,
	customVendors: NonIABVendor[],
): ConsentIabSelection {
	const purposeConsents: Record<number, boolean> = { 1: true };
	const purposeLegitimateInterests: Record<number, boolean> = {};
	for (const purposeId of Object.keys(gvl.purposes)) {
		if (Number(purposeId) !== 1) {
			purposeConsents[Number(purposeId)] = false;
			purposeLegitimateInterests[Number(purposeId)] = false;
		}
	}

	const vendorConsents: Record<string, boolean> = {};
	const vendorLegitimateInterests: Record<string, boolean> = {};

	for (const [vendorId, vendor] of Object.entries(gvl.vendors)) {
		const id = String(vendorId);
		if (vendor.purposes && vendor.purposes.length > 0) {
			vendorConsents[id] = false;
		}
		if (vendor.legIntPurposes && vendor.legIntPurposes.length > 0) {
			vendorLegitimateInterests[id] = false;
		}
	}

	for (const vendor of customVendors) {
		const id = String(vendor.id);
		if (vendor.purposes && vendor.purposes.length > 0) {
			vendorConsents[id] = false;
		}
		if (vendor.legIntPurposes && vendor.legIntPurposes.length > 0) {
			vendorLegitimateInterests[id] = false;
		}
	}

	const specialFeatureOptIns: Record<number, boolean> = {};
	for (const featureId of Object.keys(gvl.specialFeatures ?? {})) {
		specialFeatureOptIns[Number(featureId)] = false;
	}

	return {
		purposeConsents,
		purposeLegitimateInterests,
		vendorConsents,
		vendorLegitimateInterests,
		specialFeatureOptIns,
		preferenceCenterTab: 'purposes',
	};
}

const init = useConsentInit();
const consentView = initConsentView(init);
const config = useConsentConfig();
const activeUI = useConsentActiveUI();
const selection = useConsentSelection();
const iabSelection = useConsentIabSelection();

const isIabMode = computed(
	() => init.value?.policy?.model === 'iab' && Boolean(init.value?.gvl),
);

onMounted(() => {
	for (const [key, value] of Object.entries(config.value.tokens ?? {})) {
		document.documentElement.style.setProperty(`--${key}`, String(value));
	}
});

watch(init, (initValue) => {
	if (!initValue) {
		return;
	}

	if (initValue.policy?.model === 'iab' && initValue.gvl) {
		iabSelection.value = buildDefaultIabSelection(
			initValue.gvl,
			initValue.customVendors ?? [],
		);
	} else {
		const { categories } = consentView.value;
		selection.value = selection.value.filter((category) =>
			categories.includes(category),
		);
	}

	const mode = initValue.policy?.ui?.mode;
	if (mode === 'banner') {
		activeUI.value = 'banner';
		return;
	}

	if (mode === 'dialog') {
		activeUI.value = 'dialog';
	}
});
</script>

<template>
	<div v-if="init" class="c15t-root" data-testid="consent-root" style="display: contents">
		<template v-if="isIabMode">
			<IabConsentBanner />
			<IabConsentDialog />
		</template>
		<template v-else>
			<ConsentBanner />
			<ConsentDialog />
		</template>
	</div>
</template>
