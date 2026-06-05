export default defineNuxtConfig({
	modules: ['@c15t/vue'],
	c15t: {
		backendURL:
			process.env.NUXT_PUBLIC_C15T_BACKEND_URL ||
			'https://nuxt-consent-io.inth.app',
	},
	runtimeConfig: {
		public: {
			c15t: {
				backendURL:
					process.env.NUXT_PUBLIC_C15T_BACKEND_URL ||
					'https://nuxt-consent-io.inth.app',
			},
		},
	},
	devtools: { enabled: true },
});
