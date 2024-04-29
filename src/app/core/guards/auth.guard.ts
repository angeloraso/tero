import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { PATH as AUTH_PATH } from '@auth/auth.routing';
import { AuthService } from '@core/auth/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.signedIn$.pipe(
    take(1),
    map(isLoggedIn => {
      if (!isLoggedIn) {
        router.navigateByUrl(`/${APP_PATH.AUTH}/${AUTH_PATH.SIGN_IN}`, { replaceUrl: true });
        console.error('Not permissions');
        return false;
      }

      return true;
    })
  );
};
