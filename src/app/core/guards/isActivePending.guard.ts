import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { USER_STATE } from '@core/model';
import { UsersService } from '@core/services';

export const isActivePendingGuard = () => {
  const router = inject(Router);
  const usersService = inject(UsersService);
  return usersService.getCurrentUser().then(user => {
    if (user.status !== USER_STATE.ACTIVE && user.status !== USER_STATE.PENDING) {
      router.navigateByUrl('/', { replaceUrl: true });
      console.error('User status error: User has no active or pending status');
      return false;
    }

    return true;
  });
};
