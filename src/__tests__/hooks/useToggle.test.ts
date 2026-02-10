import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useToggle } from '@/hooks/useToggle';

describe('useToggle', () => {
  it('starts with initial value (default false)', () => {
    const { result } = renderHook(() => useToggle());
    expect(result.current[0]).toBe(false);
  });

  it('starts with custom initial value', () => {
    const { result } = renderHook(() => useToggle(true));
    expect(result.current[0]).toBe(true);
  });

  it('toggles value', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => result.current[1]());
    expect(result.current[0]).toBe(true);

    act(() => result.current[1]());
    expect(result.current[0]).toBe(false);
  });

  it('provides direct setter', () => {
    const { result } = renderHook(() => useToggle(false));

    act(() => result.current[2](true));
    expect(result.current[0]).toBe(true);
  });
});
