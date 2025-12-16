import { isDevMode } from '@angular/core';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { authReducer } from './auth/auth.reducer';
import { AuthEffects } from './auth/auth.effects';

export const storeProviders = [
  provideStore({ auth: authReducer }),
  provideEffects([AuthEffects]),
  provideStoreDevtools({
    maxAge: 25,
    logOnly: !isDevMode(),
    autoPause: true,
    trace: false,
    traceLimit: 75,
  }),
];

// Re-export for convenience
export * from './auth/auth.actions';
export * from './auth/auth.selectors';
export * from './auth/auth.state';
