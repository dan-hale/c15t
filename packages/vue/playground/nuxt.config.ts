export default defineNuxtConfig({
	modules: ['@c15t/vue'],
	c15t: {
		backendURL: 'https://c15t-demo-consent-io.inth.app',
	},
	runtimeConfig: {
		public: {
			c15t: {
				backendURL: 'https://c15t-demo-consent-io.inth.app',
			},
		},
	},
	devtools: { enabled: true },
});
