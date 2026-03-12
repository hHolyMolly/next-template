import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRef } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';

describe('useClickOutside', () => {
  it('calls handler when clicking outside the element', () => {
    const handler = vi.fn();
    const outside = document.createElement('div');
    document.body.appendChild(outside);

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(document.createElement('div'));
      document.body.appendChild(ref.current);
      useClickOutside(ref, handler);
      return ref;
    });

    outside.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();

    document.body.innerHTML = '';
  });

  it('does not call handler when clicking inside the element', () => {
    const handler = vi.fn();

    const { result } = renderHook(() => {
      const ref = useRef<HTMLDivElement>(document.createElement('div'));
      document.body.appendChild(ref.current);
      useClickOutside(ref, handler);
      return ref;
    });

    result.current.current!.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(handler).not.toHaveBeenCalled();

    document.body.innerHTML = '';
  });

  it('handles touchstart events', () => {
    const handler = vi.fn();
    const outside = document.createElement('div');
    document.body.appendChild(outside);

    renderHook(() => {
      const ref = useRef<HTMLDivElement>(document.createElement('div'));
      document.body.appendChild(ref.current);
      useClickOutside(ref, handler);
      return ref;
    });

    outside.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
    expect(handler).toHaveBeenCalledOnce();

    document.body.innerHTML = '';
  });
});
