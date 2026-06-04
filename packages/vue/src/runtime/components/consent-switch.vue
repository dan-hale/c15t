<script setup lang="ts">
import { SwitchRoot, SwitchThumb } from 'reka-ui';
import switchStyles from '@c15t/styles/switch.module.css';
import { useConsentConfig } from '#c15t/composables';

defineProps<{
	disabled?: boolean;
	ariaLabel?: string;
	indeterminate?: boolean;
}>();

const model = defineModel<boolean>({ default: false });

const config = useConsentConfig();
</script>

<template>
	<SwitchRoot
		v-model="model"
		v-bind="config.components?.switch?.root"
		:disabled="disabled"
		:aria-label="ariaLabel"
		:data-indeterminate="indeterminate ? true : undefined"
		data-testid="consent-switch"
		:class="switchStyles.root"
	>
		<span :class="switchStyles.track" data-slot="switch-track">
			<SwitchThumb :class="switchStyles.thumb" data-slot="switch-thumb" />
		</span>
	</SwitchRoot>
</template>
