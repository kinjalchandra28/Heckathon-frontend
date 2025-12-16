import { createReducer, on } from '@ngrx/store';
import { AuthActions } from './auth.actions';
import { AuthState, initialAuthState } from './auth.state';

export const authReducer = createReducer(
  initialAuthState,

  // Login
  on(AuthActions.login, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.loginSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    loading: false,
    error: null,
  })),
  on(AuthActions.loginFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Register
  on(AuthActions.register, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(AuthActions.registerSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: true,
    loading: false,
    error: null,
  })),
  on(AuthActions.registerFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Logout
  on(AuthActions.logout, (state) => ({
    ...state,
    loading: true,
  })),
  on(AuthActions.logoutSuccess, () => ({
    ...initialAuthState,
    sessionChecked: true,
  })),
  on(AuthActions.logoutFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  // Check Session
  on(AuthActions.checkSession, (state) => ({
    ...state,
    loading: true,
  })),
  on(AuthActions.checkSessionSuccess, (state, { user }) => ({
    ...state,
    user,
    isAuthenticated: !!user,
    loading: false,
    sessionChecked: true,
  })),
  on(AuthActions.checkSessionFailure, (state) => ({
    ...state,
    loading: false,
    sessionChecked: true,
  })),

  // Clear Error
  on(AuthActions.clearError, (state) => ({
    ...state,
    error: null,
  }))
);
