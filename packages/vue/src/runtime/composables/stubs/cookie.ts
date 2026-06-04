import { customRef, type Ref } from 'vue';

export interface C15tCookieOptions<T> {
	default?: () => T;
}

function readCookie(name: string): string | null {
	if (typeof document === 'undefined') {
		return null;
	}

	const match = document.cookie.match(
		new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`)
	);
	if (!match?.[1]) {
		return null;
	}

	return decodeURIComponent(match[1]);
}

function writeCookie(name: string, value: string): void {
	if (typeof document === 'undefined') {
		return;
	}

	document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; SameSite=Lax`;
}

export function useCookie<T>(
	name: string,
	options: C15tCookieOptions<T> = {}
): Ref<T | null> {
	const initial = readCookie(name);
	const defaultValue = options.default?.() ?? null;

	return customRef<T | null>((track, trigger) => {
		let current: T | null = defaultValue;

		if (initial) {
			try {
				current = JSON.parse(initial) as T;
			} catch {
				current = initial as T;
			}
		}

		return {
			get() {
				track();
				return current;
			},
			set(value: T | null) {
				current = value;
				if (value === null) {
					writeCookie(name, '');
				} else {
					writeCookie(name, JSON.stringify(value));
				}

				trigger();
			},
		};
	});
}
