<script setup lang="ts">
import { computed } from 'vue';
import { SwitchRoot, SwitchThumb } from 'reka-ui';
import switchStyles from '@c15t/styles/switch.module.css';
import { useConsentConfig } from '#c15t/composables';

const props = withDefaults(
	defineProps<{
		disabled?: boolean;
		ariaLabel?: string;
		indeterminate?: boolean;
		size?: 'small' | 'medium';
	}>(),
	{
		size: 'medium',
	},
);

const model = defineModel<boolean>({ default: false });

const config = useConsentConfig();

const isSmall = computed(() => props.size === 'small');
</script>

<template>
	<SwitchRoot
		v-model="model"
		v-bind="config.components?.switch?.root"
		:disabled="disabled"
		:aria-label="ariaLabel"
		:data-indeterminate="indeterminate ? true : undefined"
		data-testid="consent-switch"
		:class="[
			switchStyles.root,
			isSmall ? switchStyles.rootSmall : undefined,
		]"
	>
		<span
			:class="[
				switchStyles.track,
				isSmall ? switchStyles.trackSmall : undefined,
			]"
		>
			<SwitchThumb
				:class="[
					switchStyles.thumb,
					isSmall ? switchStyles.thumbSmall : undefined,
				]"
			/>
		</span>
	</SwitchRoot>
</template>
