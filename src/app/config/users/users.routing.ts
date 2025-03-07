import { Routes } from '@angular/router';
import { configGuard } from '@core/guards';

export enum PATH {
  EMPTY = ''
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@config/users/users.component').then(m => m.UsersComponent),
    pathMatch: 'full'
  },
  {
    path: ':userEmail',
    loadComponent: () => import('@config/users/edit-user/edit-user.component').then(m => m.EditUserComponent),
    canActivate: [configGuard]
  }
];

