import counterReducer, {
  setIncrement,
  setDecrement,
  setIncrementByAmount,
} from '@/store/slices/counterSlice';

describe('counterSlice', () => {
  const initialState = { value: 0 };

  it('should return the initial state', () => {
    expect(counterReducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  it('should increment', () => {
    const state = counterReducer(initialState, setIncrement());
    expect(state.value).toBe(1);
  });

  it('should decrement', () => {
    const state = counterReducer({ value: 5 }, setDecrement());
    expect(state.value).toBe(4);
  });

  it('should increment by amount', () => {
    const state = counterReducer(initialState, setIncrementByAmount(10));
    expect(state.value).toBe(10);
  });

  it('should handle negative amounts', () => {
    const state = counterReducer({ value: 5 }, setIncrementByAmount(-3));
    expect(state.value).toBe(2);
  });
});
