import type { AnyInterpreter, EventObject, StateNode } from 'xstate';
import camelcase from 'camelcase';
import type { DefaultActionsOverride, Expand } from './convert';

type StringToCamelCase<S extends string> = S extends `${infer T}_${infer U}`
	? `${Lowercase<T>}${Capitalize<StringToCamelCase<U>>}`
	: S extends `${infer T}-${infer U}`
	? `${Lowercase<T>}${Capitalize<StringToCamelCase<U>>}`
	: S extends `${infer T} ${infer U}`
	? `${Lowercase<T>}${Capitalize<StringToCamelCase<U>>}`
	: Lowercase<S>;

export type ConvertedActions<Event extends EventObject, KK extends keyof Event = keyof Event> = {
	[K in Event['type'] as StringToCamelCase<K>]: keyof Omit<Extract<Event, { type: K }>, 'type'> extends [never]
		? () => void
		: (payload: Expand<Omit<Extract<Event, { type: K }>, 'type'>>) => void;
};

export const convertActions = <Service extends AnyInterpreter, Overrides extends DefaultActionsOverride>(
	service: Service,
	overrides?: Overrides,
): Expand<ConvertedActions<Service['state']['event']> & Overrides> => {
	const mapping: any = { ...overrides } || {};
	const events = new Set();
	const getMapping = (state: StateNode) => {
		if (state.on) {
			for (const event of Object.keys(state.on)) {
				if (!events.has(event)) {
					events.add(event);
					const camelEvent = camelcase(event) as keyof Overrides;
					mapping[camelEvent] = (payload: any) =>
						typeof overrides?.[camelEvent] === 'function'
							? // @ts-ignore
							  overrides[camelEvent]!(payload)
							: service.send({ ...(payload || {}), type: event });
				}
			}
		}
	};

	for (const value of Object.values(service.machine.config.states || {})) {
		getMapping(value as StateNode);
	}

	return mapping;
};
