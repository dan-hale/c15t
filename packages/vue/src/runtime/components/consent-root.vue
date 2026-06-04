<script setup lang="ts">
import { computed, provide } from 'vue';
import { consentConfigKey } from '#c15t/composables';
import type { ConsentConfig } from '#c15t/config';
import ConsentRootContent from './consent-root-content.vue';

const props = defineProps<{
	config?: Partial<ConsentConfig>;
}>();

provide(
	consentConfigKey,
	computed(() => props.config),
);
</script>

<template>
	<ConsentRootContent />
</template>
