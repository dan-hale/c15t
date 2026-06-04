import {
	addComponent,
	addImports,
	createResolver,
	defineNuxtModule,
} from '@nuxt/kit';

export interface ModuleOptions {
	backendURL?: string;
}

export default defineNuxtModule<ModuleOptions>({
	meta: {
		name: '@c15t/vue',
		configKey: 'c15t',
	},
	defaults: {},
	async setup(options, nuxt) {
		const resolver = createResolver(import.meta.url);
		nuxt.options.alias['#c15t/stub'] = resolver.resolve(
			'./runtime/stub.nuxt.ts'
		);
		nuxt.options.alias['#c15t/config'] = resolver.resolve(
			'./runtime/config.nuxt.ts'
		);
		nuxt.options.alias['#c15t/composables'] = resolver.resolve(
			'./runtime/composables.nuxt.ts'
		);

		nuxt.options.runtimeConfig.public.c15t = {
			...(nuxt.options.runtimeConfig.public.c15t as object),
			...options,
		};

		nuxt.options.build.transpile.push('@c15t/vue', '@c15t/styles');

		addComponent({
			name: 'ConsentRoot',
			filePath: resolver.resolve('./runtime/components/consent-root.nuxt.vue'),
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
