import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  agentCode: string | null;
  phone: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  agentCode: null,
  phone: null,
  isAuthenticated: false,
};

export const authSlice = createSlice({
  name: 'authentication',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{
      token: string;
      refreshToken?: string;
      agentCode?: string;
      phone?: string;
    }>) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken ?? null;
      state.agentCode = action.payload.agentCode ?? null;
      state.phone = action.payload.phone ?? null;
      state.isAuthenticated = true;
    },
    logout: () => {
      return initialState;
    },
  },
});

export const authActions = authSlice.actions;
export const authReducer = authSlice.reducer;
