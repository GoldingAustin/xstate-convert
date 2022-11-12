import type { AnyInterpreter, AnyStateMachine, InterpreterFrom, StateFrom, StateSchema, Typestate, State as XState } from 'xstate';
import type { ConvertedActions } from './convertActions';
import { convertActions } from './convertActions';
import { convertState } from './convertState';

export type Expand<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;

export type DefaultContextOverride<Service extends AnyInterpreter, State extends Service['state']> = Partial<
	State['context']
> &
	Record<PropertyKey, unknown>;

export type DefaultActionsOverride = Record<PropertyKey, (...args: any[]) => unknown>;

export type ConvertMachine<
	Machine extends AnyStateMachine,
	Overrides extends {
		context?: DefaultContextOverride<InterpreterFrom<Machine>, State>;
		actions?: DefaultActionsOverride;
	} = {
		context?: DefaultContextOverride<InterpreterFrom<Machine>, StateFrom<Machine>>;
		actions?: DefaultActionsOverride;
	},
	State extends StateFrom<Machine> = StateFrom<Machine>,
> = Expand<
	State['context'] &
		Overrides['context'] &
		Overrides['actions'] &
		Omit<ConvertedActions<State['event']>, keyof Overrides['actions']>
>;
export type ConvertedService<
	Service extends AnyInterpreter,
	State extends Service['state'],
	OverrideContext extends DefaultContextOverride<Service, State>,
	OverrideActions extends DefaultActionsOverride,
> = [
	XState<
		Expand<State['context'] & OverrideContext>,
		State['event'],
		StateSchema<Expand<State['context'] & OverrideContext>>,
		Typestate<Expand<State['context'] & OverrideContext>>,
		Service['machine']['__TResolvedTypesMeta']
	>,
	Expand<Omit<ConvertedActions<State['event']>, keyof OverrideActions> & OverrideActions>,
	Service,
];

export type Overrides<
	Service extends AnyInterpreter,
	State extends Service['state'],
	OverrideContext extends DefaultContextOverride<Service, State>,
	OverrideActions extends DefaultActionsOverride,
> = {
	context?: (state: State) => OverrideContext;
	actions?: (state: State, send: Service['send']) => OverrideActions;
};

export const getServiceTuple = <Service extends AnyInterpreter, State extends Service['state']>(
	initial: [State, Service['send'], Service] | Service,
): [State | Service['state'], Service['send'], Service] =>
	Array.isArray(initial) ? initial : [initial.state, initial.send, initial];

export const convert = <
	Service extends AnyInterpreter,
	State extends Service['state'],
	OverrideContext extends DefaultContextOverride<Service, State>,
	OverrideActions extends DefaultActionsOverride,
>(
	initial: [State, Service['send'], Service] | Service,
	overrides?: Overrides<Service, Service['state'] | State, OverrideContext, OverrideActions>,
): ConvertedService<Service, Service['state'] | State, OverrideContext, OverrideActions> => {
	const [state, send, service] = getServiceTuple(initial);
	return [
		convertState(state, overrides?.context?.(state)),
		convertActions(service, overrides?.actions?.(state, send)),
		service,
	];
};
