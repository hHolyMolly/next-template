'use client';

import { type RefObject, useEffect } from 'react';

import { useLatestRef } from '@/hooks/useLatestRef';

/**
 * Attach an event listener with automatic cleanup.
 *
 * Overloads:
 * 1. `useEventListener('resize', fn)` — listens on `window`.
 * 2. `useEventListener('keydown', fn, ref)` — listens on `ref.current`.
 * 3. `useEventListener('visibilitychange', fn, documentRef)` — on `document`.
 *
 * `options` is read at attach time via a ref, so passing an inline object
 * literal doesn't re-attach the listener every render. Only a change of
 * `capture` re-attaches (it affects WHICH listener the browser removes).
 */
export function useEventListener<K extends keyof WindowEventMap>(
  event: K,
  handler: (e: WindowEventMap[K]) => void,
  target?: undefined,
  options?: AddEventListenerOptions | boolean,
): void;
export function useEventListener<K extends keyof HTMLElementEventMap, T extends HTMLElement>(
  event: K,
  handler: (e: HTMLElementEventMap[K]) => void,
  target: RefObject<T | null>,
  options?: AddEventListenerOptions | boolean,
): void;
export function useEventListener<K extends keyof DocumentEventMap>(
  event: K,
  handler: (e: DocumentEventMap[K]) => void,
  target: RefObject<Document | null>,
  options?: AddEventListenerOptions | boolean,
): void;
export function useEventListener(
  event: string,
  handler: (e: Event) => void,
  target?: RefObject<EventTarget | null>,
  options?: AddEventListenerOptions | boolean,
): void {
  const handlerRef = useLatestRef(handler);
  const optionsRef = useLatestRef(options);
  const capture = typeof options === 'boolean' ? options : (options?.capture ?? false);

  useEffect(() => {
    const node: EventTarget | null = target ? target.current : window;
    if (!node) return;

    const listener = (e: Event) => handlerRef.current(e);
    const opts = optionsRef.current;
    node.addEventListener(event, listener, opts);
    return () => node.removeEventListener(event, listener, opts);
  }, [event, target, capture, handlerRef, optionsRef]);
}
