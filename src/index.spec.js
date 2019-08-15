import EventEmitter from 'events';

import React from 'react';
import { renderHook } from '@testing-library/react-hooks';

import useEventEmitter from '.';

let emitter;

beforeEach(() => {
	emitter = new EventEmitter();
});

afterEach(() => {
	jest.resetAllMocks();
});

it('listens to an event', () => {
	const handler = jest.fn();
	renderHook(() => useEventEmitter(emitter, 'some event', handler));

	emitter.emit('some event', 'value');

	expect(handler).toHaveBeenCalledWith('value');
});

it('calls the same handler on rerender', () => {
	const handler = jest.fn();
	const { rerender } = renderHook(() => useEventEmitter(emitter, 'some event', handler));

	rerender();
	emitter.emit('some event', 'value');

	expect(handler).toHaveBeenCalledWith('value');
});

it('removes listener on unmount', () => {
	const handler = jest.fn();
	const { unmount } = renderHook(() => useEventEmitter(emitter, 'some event', handler));

	unmount();
	emitter.emit('some event', 'value');

	expect(handler).not.toHaveBeenCalled();
});

it('switches event names', () => {
	let eventName = 'some event';
	const handler = jest.fn();
	const { rerender } = renderHook(() => useEventEmitter(emitter, eventName, handler));

	eventName = 'some other event';
	rerender();
	emitter.emit('some event', 'value');
	emitter.emit('some other event', 'other value');

	expect(handler).not.toHaveBeenCalledWith('value');
	expect(handler).toHaveBeenCalledWith('other value');
});

it('switches handlers', () => {
	const firstHandler = jest.fn();
	let handler = firstHandler;
	const { rerender } = renderHook(() => useEventEmitter(emitter, 'some event', handler));

	const secondHandler = jest.fn();
	handler = secondHandler;
	rerender();
	emitter.emit('some event', 'value');

	expect(firstHandler).not.toHaveBeenCalled();
	expect(secondHandler).toHaveBeenCalledWith('value');
});

it('can specify once', () => {
	const handler = jest.fn();
	renderHook(() => useEventEmitter(emitter, 'some event', handler, { once: true }));

	emitter.emit('some event', 'value');
	emitter.emit('some event', 'other value');

	expect(handler).toHaveBeenCalledTimes(1);
	expect(handler).toHaveBeenCalledWith('value');
});

it('can specify prepend', () => {
	const handler = jest.fn();
	const prependedHandler = jest.fn();

	handler.mockImplementation(() => expect(prependedHandler).toHaveBeenCalledWith('value'));
	prependedHandler.mockImplementation(() => expect(handler).not.toHaveBeenCalled());

	renderHook(() => useEventEmitter(emitter, 'some event', handler));
	renderHook(() => useEventEmitter(emitter, 'some event', prependedHandler, { prepend: true }));

	emitter.emit('some event', 'value');

	expect(prependedHandler).toHaveBeenCalledTimes(1);
	expect(handler).toHaveBeenCalledTimes(1);
});

it('can specify once and prepend', () => {
	const handler = jest.fn();
	const prependedHandler = jest.fn();

	handler.mockImplementation(() => expect(prependedHandler).toHaveBeenCalledWith('value'));
	prependedHandler.mockImplementation(() => expect(handler).not.toHaveBeenCalled());

	renderHook(() => useEventEmitter(emitter, 'some event', handler));
	renderHook(() => useEventEmitter(emitter, 'some event', prependedHandler, { once: true, prepend: true }));

	emitter.emit('some event', 'value');
	emitter.emit('some event', 'value');

	expect(prependedHandler).toHaveBeenCalledTimes(1);
	expect(handler).toHaveBeenCalledTimes(2);
});

it('useDebugValue', () => {
	jest.spyOn(React, 'useDebugValue');
	const handler = jest.fn();
	renderHook(() => useEventEmitter(emitter, 'some event', handler));

	expect(React.useDebugValue).toHaveBeenCalledWith(handler);
});
