'use client';

import { type RefObject, useEffect, useRef } from 'react';

/**
 * Attach an event listener with automatic cleanup.
 *
 * Overloads:
 * 1. `useEventListener('resize', fn)` — listens on `window`.
 * 2. `useEventListener('keydown', fn, ref)` — listens on `ref.current`.
 * 3. `useEventListener('visibilitychange', fn, documentRef)` — on `document`.
 *
 * Always SSR-safe; does nothing on the server.
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
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const node: EventTarget | null = target ? target.current : window;
    if (!node) return;

    const listener = (e: Event) => handlerRef.current(e);
    node.addEventListener(event, listener, options);
    return () => node.removeEventListener(event, listener, options);
  }, [event, target, options]);
}
