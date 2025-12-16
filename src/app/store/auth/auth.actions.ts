import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { User, LoginCredentials, RegisterCredentials } from '../../core/models/user.model';

export const AuthActions = createActionGroup({
  source: 'Auth',
  events: {
    // Login
    Login: props<{ credentials: LoginCredentials }>(),
    'Login Success': props<{ user: User }>(),
    'Login Failure': props<{ error: string }>(),

    // Register
    Register: props<{ credentials: RegisterCredentials }>(),
    'Register Success': props<{ user: User }>(),
    'Register Failure': props<{ error: string }>(),

    // Logout
    Logout: emptyProps(),
    'Logout Success': emptyProps(),
    'Logout Failure': props<{ error: string }>(),

    // Session
    'Check Session': emptyProps(),
    'Check Session Success': props<{ user: User | null }>(),
    'Check Session Failure': props<{ error: string }>(),

    // Clear Error
    'Clear Error': emptyProps(),
  },
});
