import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { PATH } from '@app/app.routing';
import { AuthService } from '@auth/auth.service';
import { map, take } from 'rxjs/operators';

export const autoSignInGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.signedIn$.pipe(
    take(1),
    map(signedIn => {
      if (signedIn) {
        router.navigateByUrl(`/${PATH.HOME}`, { replaceUrl: true });
        return false;
      }

      return true;
    })
  );
};
