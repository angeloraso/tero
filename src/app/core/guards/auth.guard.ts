import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { AuthService } from '@auth/auth.service';
import { map, take } from 'rxjs/operators';

export const authGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.signedIn$.pipe(
    take(1),
    map(signedIn => {
      if (!signedIn) {
        router.navigateByUrl(`/${APP_PATH.AUTH}`, { replaceUrl: true });
        console.error('Not permissions');
        return false;
      }

      return true;
    })
  );
};
