import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserSettingsService } from '@core/services';

export const adminGuard = () => {
  const router = inject(Router);
  const userSettings = inject(UserSettingsService);
  return userSettings.isAdmin().then(isAdmin => {
    if (!isAdmin) {
      router.navigateByUrl('/', { replaceUrl: true });
      console.error('Role error: User has not admin role');
      return false;
    }

    return true;
  });
};
