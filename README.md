# XState Convert

A small library to take a Service or tuple of `[State, Send, Service]` and convert:
- Send events into camelCase functions
- Send events and context to custom user provided overrides

```typescript
import { convert } from "./convert";
import { interpret } from "xstate";

const [state, actions, service] = convert(interpret(countMachine).start(), {
  actions: (state) => ({
    double() {
      send.inc();
      send.inc();
    }
  }),
  context: (state) => ({
    double: state.context.count * 2
  })
})
```