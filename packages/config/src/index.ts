export type ButtonVariant = 'primary' | 'neutral';

export type ButtonMode = 'filled' | 'stroke' | 'lighter' | 'ghost';

export type ConsentActiveUI =
	| 'banner'
	| 'dialog'
	| 'top-left'
	| 'top-right'
	| 'bottom-left'
	| 'bottom-right'
	| 'center'
	| 'sheet'
	| 'drawer'
	| 'drawer-right'
	| 'manager';

export type ConsentSaveAction = 'all' | 'necessary' | 'custom';

/**
 * Central consent configuration contract shared across framework packages.
 *
 * @typeParam T - Framework attribute type bound to theme slot overrides.
 */
export interface ConsentConfig<T = Record<string, unknown>> {
	backendURL: string;
	disableAnimation?: boolean;
	trapFocus?: boolean;
	/** CSS custom property values applied as `--{key}` on `:root`. */
	tokens?: Record<string, string | number>;
	/** Per-component slot attribute overrides. */
	components?: {
		banner: {
			root?: T;
			card?: T;
			header?: T;
			title?: T;
			description?: T;
			footer?: T;
			footerSubGroup?: T;
			tag?: T;
			overlay?: T;
		};
		dialog: {
			root?: T;
			card?: T;
			header?: T;
			title?: T;
			description?: T;
			content?: T;
			footer?: T;
			tag?: T;
			overlay?: T;
		};
		manager: {
			root?: T;
			accordion?: T;
			footer?: T;
			tag?: T;
		};
		button: {
			primary?: T;
			secondary?: T;
		};
		switch: {
			root?: T;
		};
		accordion: {
			root?: T;
		};
		'accordion-item': {
			root?: T;
			trigger?: T;
			content?: T;
		};
		description: {
			banner?: T;
			dialog?: T;
			manager?: T;
		};
		tag: {
			banner?: T;
			dialog?: T;
			manager?: T;
			'iab-banner'?: T;
			'iab-dialog'?: T;
		};
		link: {
			banner?: T;
			dialog?: T;
			manager?: T;
		};
		badge: {
			root?: T;
		};
		'iab-banner': {
			root?: T;
			card?: T;
			header?: T;
			title?: T;
			description?: T;
			footer?: T;
			footerSubGroup?: T;
			tag?: T;
			overlay?: T;
		};
		'iab-dialog': {
			root?: T;
			card?: T;
			header?: T;
			title?: T;
			description?: T;
			content?: T;
			footer?: T;
			tabs?: T;
			tag?: T;
			overlay?: T;
		};
	};
}
