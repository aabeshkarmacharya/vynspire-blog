import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

export type User = { id: number | null; username?: string | null } | null;

export type AuthState = {
  access: string | null;
  refresh: string | null;
  user: User;
};

const initialAuth: AuthState = {
  access: null,
  refresh: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState: initialAuth,
  reducers: {
    loginSuccess(
      state,
      action: PayloadAction<{ access: string; refresh?: string | null; user?: User }>
    ) {
      const { access, refresh = null, user = null } = action.payload;
      state.access = access;
      state.refresh = refresh;
      state.user = user;
    },
    registerSuccess(state, action: PayloadAction<{ user: User }>) {
      state.user = action.payload.user;
    },
    refreshSuccess(state, action: PayloadAction<{ access: string }>) {
      state.access = action.payload.access;
    },
    logout(state) {
      state.access = null;
      state.refresh = null;
      state.user = null;
    },
    hydrate(state, action: PayloadAction<Partial<AuthState> | null | undefined>) {
      const data = action.payload;
      if (data && typeof data === 'object') {
        state.access = (data.access as string) ?? null;
        state.refresh = (data.refresh as string) ?? null;
        state.user = (data.user as User) ?? null;
      }
    },
  },
});

export const { loginSuccess, registerSuccess, refreshSuccess, logout, hydrate } = authSlice.actions;

export const makeStore = () =>
  configureStore({
    reducer: {
      auth: authSlice.reducer,
    },
  });

export const store = makeStore();

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Persistence helpers
export function saveAuthToStorage(getState: () => RootState): void {
  try {
    const { auth } = getState();
    if (typeof window !== 'undefined' && window?.localStorage) {
      window.localStorage.setItem('auth', JSON.stringify(auth));
    }
  } catch {
    // ignore
  }
}

export function loadAuthFromStorage(): AuthState | null {
  try {
    if (typeof window === 'undefined' || !window?.localStorage) return null;
    const raw = window.localStorage.getItem('auth');
    return raw ? (JSON.parse(raw) as AuthState) : null;
  } catch {
    return null;
  }
}
