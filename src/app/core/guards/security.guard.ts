import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UsersService } from '@core/services';

export const securityGuard = () => {
  const router = inject(Router);
  const usersService = inject(UsersService);
  return usersService.isSecurity().then(isSecurity => {
    if (!isSecurity) {
      router.navigateByUrl('/', { replaceUrl: true });
      console.error('Role error: User has not security role');
      return false;
    }

    return true;
  });
};
