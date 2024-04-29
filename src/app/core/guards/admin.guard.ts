import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth/auth.service';
import { UserSettingsService } from '@core/services';
import { map, take } from 'rxjs/operators';

export const adminGuard = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const userSettings = inject(UserSettingsService);
  return auth.signedIn$.pipe(
    take(1),
    map(async isLoggedIn => {
      if (!isLoggedIn) {
        router.navigateByUrl('/', { replaceUrl: true });
        console.error('Not permissions');
        return false;
      }

      const isAdmin = await userSettings.isAdmin();
      if (!isAdmin) {
        router.navigateByUrl('/', { replaceUrl: true });
        console.error('Not permissions');
        return false;
      }

      return true;
    })
  );
};
