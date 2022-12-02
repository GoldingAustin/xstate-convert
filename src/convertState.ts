import type { AnyInterpreter, StateSchema, Typestate } from 'xstate';
import { State as XState } from 'xstate';
import type { Expand } from './convert';

export const convertState = <Service extends AnyInterpreter, State extends Service['state'], Override>(
	state: State | Service['state'],
	override?: Override,
): XState<
	Expand<State['context'] & Override>,
	State['event'],
	StateSchema<Expand<State['context'] & Override>>,
	Typestate<Expand<State['context'] & Override>>,
	Service['machine']['__TResolvedTypesMeta']
> => {
	const context = { ...state.context };
	if (override) {
		for (const key of Object.keys(override)) {
			context[key] = override[key as keyof typeof override];
		}
	}
	return XState.create({...state, context});
};
