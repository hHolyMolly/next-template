# Place Redux Toolkit slices here

Example:

```ts
// src/store/slices/auth.ts
import { createSlice } from '@reduxjs/toolkit';

type AuthState = { userId: string | null };
const initialState: AuthState = { userId: null };

const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signedIn(state, action: { payload: string }) {
      state.userId = action.payload;
    },
    signedOut(state) {
      state.userId = null;
    },
  },
});

export const { signedIn, signedOut } = auth.actions;
export default auth.reducer;
```

Then register in `src/store/index.ts`:

```ts
import auth from '@/store/slices/auth';
// ...
reducer: { auth },
```

Typed hooks live in `@/store/hooks` — never import them from `@/store`.
