import { Routes } from '@angular/router';
import { configGuard } from '@core/guards';
import { analyticsResolver } from '@core/resolvers';

export enum PATH {
  EMPTY = ''
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@config/users/users.component').then(m => m.UsersComponent),
    pathMatch: 'full',
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'users' }
  },
  {
    path: ':userEmail',
    loadComponent: () => import('@config/users/edit-user/edit-user.component').then(m => m.EditUserComponent),
    canActivate: [configGuard],
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'edit-user' }
  }
];
