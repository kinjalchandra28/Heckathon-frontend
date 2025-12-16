import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { Store } from '@ngrx/store';
import { map, filter, take, switchMap } from 'rxjs/operators';
import { selectIsAuthenticated, selectSessionChecked } from '../../store';

export const authGuard: CanActivateFn = (route, state) => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectSessionChecked).pipe(
    filter((checked) => checked),
    take(1),
    switchMap(() => store.select(selectIsAuthenticated)),
    map((isAuthenticated) => {
      if (!isAuthenticated) {
        router.navigate(['/login'], {
          queryParams: { returnUrl: state.url },
        });
        return false;
      }
      return true;
    })
  );
};

export const loginGuard: CanActivateFn = () => {
  const store = inject(Store);
  const router = inject(Router);

  return store.select(selectSessionChecked).pipe(
    filter((checked) => checked),
    take(1),
    switchMap(() => store.select(selectIsAuthenticated)),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        router.navigate(['/explore']);
        return false;
      }
      return true;
    })
  );
};
