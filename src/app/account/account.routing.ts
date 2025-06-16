import { Routes } from '@angular/router';
import { analyticsResolver } from '@core/resolvers';

export enum PATH {
  EMPTY = '',
  USERS = 'users',
  NOTIFICATION_SETTINGS = 'notification-settings',
  ACCOUNT_MESSAGES = 'account-messages'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@account/account.component').then(m => m.AccountComponent),
    pathMatch: 'full',
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'account' }
  },
  {
    path: PATH.ACCOUNT_MESSAGES,
    loadChildren: () => import('@account/account-messages/account-messages.routing').then(m => m.ROUTES)
  },
  {
    path: PATH.NOTIFICATION_SETTINGS,
    loadChildren: () => import('@account/notification-settings/notification-settings.routing').then(m => m.ROUTES)
  },
  {
    path: PATH.USERS,
    loadChildren: () => import('@account/users/users.routing').then(m => m.ROUTES)
  }
];
