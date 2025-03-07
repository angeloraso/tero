import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { UsersService } from '@core/services';

export enum PATH {
  EMPTY = '',
  INVOICES = 'invoices'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@dashboard/security/security.component').then(m => m.SecurityComponent),
    pathMatch: 'full'
  },
  {
    path: PATH.INVOICES,
    loadComponent: () => import('@dashboard/security/security-invoices/security-invoices.component').then(m => m.SecurityInvoicesComponent),
    canMatch: [
      () => {
        const router = inject(Router);
        const usersService = inject(UsersService);
        return Promise.all([usersService.isNeighbor(), usersService.isSecurity()]).then(
          ([isNeighbor, isSecurity]) => {
            if (!isNeighbor && !isSecurity) {
              router.navigateByUrl('/', { replaceUrl: true });
              console.error('Role error: User has not security or neighbor role');
              return false;
            }

            return true;
          }
        );
      }
    ]
  },
  {
    path: ':group',
    loadChildren: () =>
      import('@dashboard/security/security-group/security-group.routing').then(
        m => m.ROUTES
      )
  }
];
