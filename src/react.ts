import type { ConvertedService, DefaultActionsOverride, DefaultContextOverride, Overrides } from './convert';
import type { AnyInterpreter } from 'xstate';
import { useMemo } from 'react';
import { getServiceTuple } from './convert';
import { convertState } from './convertState';
import { convertActions } from './convertActions';

export function useXstateConvert<
	Service extends AnyInterpreter,
	State extends Service['state'],
	OverrideContext extends DefaultContextOverride<Service, State>,
	OverrideActions extends DefaultActionsOverride<Service, State>,
>(
	initial: [State, Service['send'], Service] | (Service & { state: State }),
	overrides?: Overrides<Service, Service['state'] | State, OverrideContext, OverrideActions>,
): ConvertedService<Service, State, OverrideContext, OverrideActions> {
	const [initialState, initialSend, service] = useMemo(() => getServiceTuple(initial), [initial]);
	const state = useMemo(
		() => convertState<Service, State, OverrideContext>(initialState, overrides?.context?.(initialState)),
		[initialState.context, initialState.value],
	);
	const actions = useMemo(
		() => convertActions(service, overrides?.actions?.(state, initialSend)),
		[state, initialSend],
	);
	return [state, actions, service];
}
