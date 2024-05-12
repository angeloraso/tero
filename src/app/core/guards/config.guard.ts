import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserSettingsService } from '@core/services';

export const configGuard = () => {
  const router = inject(Router);
  const userSettings = inject(UserSettingsService);
  return userSettings.isConfig().then(isConfig => {
    if (!isConfig) {
      router.navigateByUrl('/', { replaceUrl: true });
      console.error('Role error: User has not config role');
      return false;
    }

    return true;
  });
};
