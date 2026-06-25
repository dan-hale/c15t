import type { ConsentActiveUI } from '@c15t/config';
import type { InitOutput } from '@c15t/schema/types';

/**
 * Persistent, policy-agnostic record of a subject's consent decisions.
 *
 * Only choices the subject has *explicitly* made are stored. The active policy
 * is never written into this record — it is layered on top at read time — so a
 * single record can travel between jurisdictions (e.g. EU → California) without
 * a policy silently rewriting what the user actually decided.
 */
export interface Consent {
	/**
	 * Per-policy acknowledgements, keyed by `policyId`.
	 *
	 * The `fingerprint` pins the exact policy version the subject acted under and
	 * `timestamp` anchors expiry. A fingerprint change or an elapsed `expiryDays`
	 * window are what force a fresh prompt, so this map — not the category
	 * choices — is the source of truth for "has this policy been satisfied".
	 */
	policies: Record<string, { fingerprint: string; timestamp: string }>;

	/**
	 * Sparse map of explicit decisions. An absent category means "no choice yet"
	 * and is resolved by the active policy at read time — it is deliberately not
	 * the same as an explicit `'deny'`, which is sticky across all jurisdictions.
	 */
	categories: Record<string, 'grant' | 'deny'>;
}

/**
 * Projects the subject's stored decisions onto the categories the active policy
 * actually governs, returning the categories that are effectively granted.
 *
 * This is the single read-time authority for gating (scripts, tags, network):
 * explicit user choices always win, while unspecified categories fall back to
 * the lawful default for the policy's model. The same record therefore yields
 * different results per jurisdiction without ever being mutated — an EU policy
 * treats silence as denial, an opt-out policy treats it as permission.
 *
 * @param consent - The subject's stored decisions.
 * @param init - The resolved `/init` payload describing the active policy.
 * @param gpc - When `true`, a Global Privacy Control signal is present *and* the
 *   active policy honors it; tracking categories left unspecified are denied.
 * @returns The granted category keys, scoped to the active policy.
 */
export function interpretStoredConsent(
	consent: Consent,
	init: InitOutput,
	gpc?: boolean
): string[] {
	console.log('interpretStoredConsent', consent, init, gpc);
	const policy = init.policy;
	const model = policy?.model ?? 'opt-in';

	const declared = policy?.consent?.categories?.filter(
		(category) => category !== '*'
	);
	const inScope =
		declared && declared.length > 0
			? declared
			: [...new Set(['necessary', ...Object.keys(consent.categories)])];

	const grantedByDefault = model === 'opt-out' || model === 'none';
	const granted: string[] = [];

	for (const category of inScope) {
		const choice = consent.categories[category];

		if (choice) {
			if (choice === 'grant') {
				granted.push(category);
			}
			continue;
		}

		if (category === 'necessary') {
			granted.push(category);
			continue;
		}

		const isTracking = category === 'marketing' || category === 'measurement';
		if (grantedByDefault && !(gpc && isTracking)) {
			granted.push(category);
		}
	}

	return granted;
}

/**
 * Decides which consent surface (if any) must be shown for the active policy.
 *
 * A prompt is the legal mechanism for obtaining a fresh affirmative act, so it
 * is required whenever the subject's acknowledgement of the *current* policy is
 * missing, stale (the fingerprint changed), or expired — but only when the
 * policy mandates a prompt and the decision isn't already satisfied another
 * way. Where the policy honors GPC, an opt-out signal *is* the decision, so no
 * banner is shown; in opt-in regimes GPC cannot substitute for consent and the
 * surface is still required.
 *
 * @param consent - The subject's stored decisions.
 * @param init - The resolved `/init` payload describing the active policy.
 * @param gpc - When `true`, a Global Privacy Control signal is present *and* the
 *   active policy honors it, suppressing the prompt in opt-out regimes.
 * @returns The surface to display, or `'none'` when no prompt is needed.
 */
export function deriveActiveConsentUi(
	consent: Consent,
	init: InitOutput,
	gpc?: boolean
): ConsentActiveUI {
	if (!init.policy?.ui?.mode || init.policy?.ui?.mode === 'none') return null;

	// If GPC is present and the model is opt-out
	if (gpc && init.policy?.model === 'opt-out') return 'none';

	return init.policy?.ui?.mode;
}
