import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserSettingsService } from '@core/services';

export const neighborGuard = () => {
  const router = inject(Router);
  const userSettings = inject(UserSettingsService);
  return userSettings.isNeighbor().then(isNeighbor => {
    if (!isNeighbor) {
      router.navigateByUrl('/', { replaceUrl: true });
      console.error('Role error: User has not neighbor role');
      return false;
    }

    return true;
  });
};
