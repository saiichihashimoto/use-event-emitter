import { useDebugValue, useEffect } from 'react';

const map = {
	0: 'addListener',
	1: 'prependListener',
	2: 'once',
	3: 'prependOnceListener',
};

export default function useEventEmitter(
	emitter,
	name,
	handler,
	{ once = false, prepend = false } = {}
) {
	useDebugValue(handler);

	useEffect(() => {
		emitter[map[(once ? 2 : 0) + (prepend ? 1 : 0)]](name, handler);

		return () => emitter.removeListener(name, handler);
	}, [handler, emitter, name, once, prepend]);
}
