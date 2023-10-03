import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { map, take } from 'rxjs/operators';

export const autoLoginCanLoadGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.isLoggedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      if (isLoggedIn) {
        router.navigateByUrl('/-', { replaceUrl: true });
        return false;
      }

      return true;
    })
  );
};
