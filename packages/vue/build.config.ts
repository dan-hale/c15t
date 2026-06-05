import { fileURLToPath } from 'node:url';
import { resolve } from 'pathe';
import { defineBuildConfig } from 'unbuild';

const dir = fileURLToPath(new URL('.', import.meta.url));

export default defineBuildConfig({
	entries: ['./src/vite', './src/index'],
	declaration: true,
	alias: {
		'#c15t/stub': resolve(dir, 'src/runtime/stub.vue.ts'),
	},
	externals: [
		'vue',
		'vite',
		'@c15t/config',
		'@c15t/schema',
		'@c15t/styles',
		'@vueuse/core',
		'reka-ui',
		'defu',
		'ufo',
	],
});
