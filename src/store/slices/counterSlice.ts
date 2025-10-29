import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface ICounterState {
  value: number;
}

const initialState: ICounterState = {
  value: 0,
};

const counterSlice = createSlice({
  name: 'counter',
  initialState,
  reducers: {
    setIncrement: (state) => {
      state.value += 1;
    },

    setDecrement: (state) => {
      state.value -= 1;
    },

    setIncrementByAmount: (state, action: PayloadAction<ICounterState['value']>) => {
      state.value += action.payload;
    },
  },
});

export const { setIncrement, setDecrement, setIncrementByAmount } = counterSlice.actions;

export default counterSlice.reducer;
