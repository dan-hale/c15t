import type {
	InitOutput,
	PolicyUiAction,
	PolicyUiActionDirection,
	PolicyUiActionGroup,
	PolicyUiProfile,
} from '@c15t/schema/types';
import type { MaybeRef } from 'vue';
import { initConsentView } from './init-consent-view';

export type PolicySurface = 'banner' | 'dialog';

type CookieConsentAction = 'all' | 'necessary';

export interface PolicySurfaceState {
	actionGroups: PolicyUiAction[][];
	primaryActions: PolicyUiAction[];
	direction: PolicyUiActionDirection;
	shouldFillActions: boolean;
}

const DEFAULT_POLICY_ACTIONS: PolicyUiAction[] = [
	'reject',
	'accept',
	'customize',
];

function dedupeActions(actions?: PolicyUiAction[]): PolicyUiAction[] {
	if (!actions || actions.length === 0) {
		return [];
	}

	return [...new Set(actions)];
}

function resolveAllowedActions(
	allowedActions?: PolicyUiAction[]
): PolicyUiAction[] {
	const allowed = dedupeActions(allowedActions);
	return allowed.length > 0 ? allowed : [...DEFAULT_POLICY_ACTIONS];
}

function resolveActionGroups(
	allowedActions: PolicyUiAction[],
	layout?: PolicyUiActionGroup[]
): PolicyUiAction[][] {
	if (!layout || layout.length === 0) {
		return [[...allowedActions]];
	}

	const allowedSet = new Set(allowedActions);
	const groups: PolicyUiAction[][] = [];
	const seen = new Set<PolicyUiAction>();

	for (const group of layout) {
		const actions = dedupeActions(
			Array.isArray(group) ? group : [group]
		).filter((action) => {
			if (!allowedSet.has(action) || seen.has(action)) {
				return false;
			}

			seen.add(action);
			return true;
		});

		if (actions.length > 0) {
			groups.push(actions);
		}
	}

	return groups.length > 0 ? groups : [[...allowedActions]];
}

function resolvePrimaryActions(
	actionGroups: PolicyUiAction[][],
	primaryActions?: PolicyUiAction[]
): PolicyUiAction[] {
	const orderedActions = actionGroups.flat();
	const defaultPrimary = orderedActions.includes('customize')
		? (['customize'] satisfies PolicyUiAction[])
		: [];

	if (!primaryActions || primaryActions.length === 0) {
		return defaultPrimary;
	}

	const filtered = primaryActions.filter((action) =>
		orderedActions.includes(action)
	);
	return filtered.length > 0 ? filtered : defaultPrimary;
}

function resolveDirection(
	direction?: PolicyUiActionDirection
): PolicyUiActionDirection {
	if (direction === 'column') {
		return 'column';
	}

	return 'row';
}

function resolveShouldFillActions(params: {
	uiProfile?: PolicyUiProfile;
	actionGroups: PolicyUiAction[][];
	direction: PolicyUiActionDirection;
}): boolean {
	const profile =
		params.uiProfile === 'balanced' ||
		params.uiProfile === 'strict' ||
		params.uiProfile === 'compact'
			? params.uiProfile
			: 'compact';
	const actionCount = new Set(params.actionGroups.flat()).size;
	const isSplitLayout = params.actionGroups.length > 1;
	const isColumn = params.direction === 'column';

	return (
		profile === 'strict' ||
		(profile === 'balanced' &&
			(actionCount <= 2 || (actionCount === 3 && (isSplitLayout || isColumn))))
	);
}

export function getCookieSelectionForAction(
	init: MaybeRef<InitOutput | null | undefined>,
	action: CookieConsentAction
): string[] {
	const { categories, necessary } = initConsentView(init).value;

	if (action === 'necessary') {
		return necessary;
	}

	return categories;
}

export function getPolicySurfaceState(
	init: InitOutput | undefined,
	surface: PolicySurface
): PolicySurfaceState {
	const surfaceConfig = init?.policy?.ui?.[surface];
	const allowedActions = resolveAllowedActions(surfaceConfig?.allowedActions);
	const actionGroups = resolveActionGroups(
		allowedActions,
		surfaceConfig?.layout
	);
	const direction = resolveDirection(surfaceConfig?.direction);

	return {
		actionGroups,
		primaryActions: resolvePrimaryActions(
			actionGroups,
			surfaceConfig?.primaryActions
		),
		direction,
		shouldFillActions: resolveShouldFillActions({
			uiProfile: surfaceConfig?.uiProfile,
			actionGroups,
			direction,
		}),
	};
}
