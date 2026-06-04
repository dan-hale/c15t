import type { ConsentActiveUI } from '@c15t/config';
import type { Ref } from 'vue';
import { useState } from '#c15t/stub';

export function useConsentActiveUI(): Ref<ConsentActiveUI | null> {
	return useState<ConsentActiveUI | null>('c15t:activeUI', () => null);
}
