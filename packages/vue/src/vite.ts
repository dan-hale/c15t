import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Plugin } from 'vite';

const dir = path.dirname(fileURLToPath(import.meta.url));

function pathResolve(...segments: string[]): string {
	return path.resolve(dir, ...segments);
}

export function c15tVue(): Plugin {
	const aliases: Record<string, string> = {
		'#c15t/stub': pathResolve('./runtime/stub.vue.ts'),
		'#c15t/composables': pathResolve('./runtime/composables/index.ts'),
	};

	return {
		name: '@c15t/vue',
		config() {
			return {
				resolve: {
					alias: aliases,
				},
			};
		},
	};
}

export default c15tVue;
