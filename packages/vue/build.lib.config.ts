import { fileURLToPath } from 'node:url';
import { resolve } from 'pathe';
import { defineBuildConfig } from 'unbuild';

const dir = fileURLToPath(new URL('.', import.meta.url));

export default defineBuildConfig({
	clean: false,
	failOnWarn: false,
	entries: [
		{
			builder: 'rollup',
			input: 'src/index',
			name: 'index',
		},
		{
			builder: 'rollup',
			input: 'src/vite',
			name: 'vite',
		},
	],
	declaration: true,
	alias: {
		'#c15t/stub': resolve(dir, 'src/runtime/stub.vue.ts'),
		'#c15t/config': resolve(dir, 'src/runtime/config.vue.ts'),
	},
	rollup: {
		emitCJS: true,
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
