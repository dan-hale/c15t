import { defaultConsentConfig } from '@c15t/config';
import {
	addComponent,
	addImports,
	addPlugin,
	createResolver,
	defineNuxtModule,
} from '@nuxt/kit';
import { defu } from 'defu';
import type { ConsentConfig } from './runtime/config';

export default defineNuxtModule<ConsentConfig>({
	meta: {
		name: '@c15t/vue',
		configKey: 'c15t',
	},
	defaults: () => defaultConsentConfig,
	async setup(options, nuxt) {
		const resolver = createResolver(import.meta.url);
		nuxt.options.alias['#c15t/stub'] = resolver.resolve(
			'./runtime/stub.nuxt.ts'
		);
		nuxt.options.alias['#c15t/composables'] = resolver.resolve(
			'./runtime/composables/index.ts'
		);

		nuxt.options.runtimeConfig.public.c15t = defu(
			nuxt.options.runtimeConfig.public.c15t ?? {},
			options
		);

		nuxt.options.build.transpile.push('@c15t/vue', '@c15t/styles');

		addPlugin(resolver.resolve('./runtime/plugin.nuxt'));

		addComponent({
			name: 'ConsentRoot',
			filePath: resolver.resolve('./runtime/components/consent-root.vue'),
		});

		addImports([
			{ from: '#c15t/composables', name: 'useConsentConfig' },
			{ from: '#c15t/composables', name: 'useConsentInit' },
			{ from: '#c15t/composables', name: 'useConsentSelection' },
			{ from: '#c15t/composables', name: 'useConsentIabSelection' },
			{ from: '#c15t/composables', name: 'useConsentLanguage' },
			{ from: '#c15t/composables', name: 'useConsentActiveUI' },
			{ from: '#c15t/composables', name: 'useConsentComponent' },
			{ from: '#c15t/composables', name: 'useRequestRegion' },
		]);
	},
});
