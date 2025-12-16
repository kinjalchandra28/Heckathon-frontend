import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, exhaustMap, catchError, tap } from 'rxjs/operators';
import { AuthActions } from './auth.actions';
import { AuthService } from '../../core/services/auth.service';
import { AppwriteError } from '../../core/models/appwrite.model';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ credentials }) =>
        this.authService.login(credentials).pipe(
          map((user) => AuthActions.loginSuccess({ user })),
          catchError((error: AppwriteError) =>
            of(AuthActions.loginFailure({ error: this.getErrorMessage(error) }))
          )
        )
      )
    )
  );

  loginSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess),
        tap(() => this.router.navigate(['/explore']))
      ),
    { dispatch: false }
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      exhaustMap(({ credentials }) =>
        this.authService.register(credentials).pipe(
          map((user) => AuthActions.registerSuccess({ user })),
          catchError((error: AppwriteError) =>
            of(AuthActions.registerFailure({ error: this.getErrorMessage(error) }))
          )
        )
      )
    )
  );

  registerSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.registerSuccess),
        tap(() => this.router.navigate(['/explore']))
      ),
    { dispatch: false }
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.logout),
      exhaustMap(() =>
        this.authService.logout().pipe(
          map(() => AuthActions.logoutSuccess()),
          catchError((error: AppwriteError) =>
            of(AuthActions.logoutFailure({ error: this.getErrorMessage(error) }))
          )
        )
      )
    )
  );

  logoutSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logoutSuccess),
        tap(() => this.router.navigate(['/login']))
      ),
    { dispatch: false }
  );

  checkSession$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.checkSession),
      exhaustMap(() =>
        this.authService.checkSession().pipe(
          map((user) => AuthActions.checkSessionSuccess({ user })),
          catchError((error: AppwriteError) =>
            of(AuthActions.checkSessionFailure({ error: this.getErrorMessage(error) }))
          )
        )
      )
    )
  );

  private getErrorMessage(error: AppwriteError): string {
    switch (error.code) {
      case 401:
        return 'Invalid email or password';
      case 409:
        return 'An account with this email already exists';
      case 429:
        return 'Too many attempts. Please try again later';
      default:
        return error.message || 'An unexpected error occurred';
    }
  }
}
