import { Routes } from '@angular/router';
import { isActivePendingGuard } from '@core/guards';
import { analyticsResolver } from '@core/resolvers';

export enum PATH {
  EMPTY = '',
  ADD = 'add',
  MESSAGE_HISTORY = 'message-history'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@account/account-messages/account-messages.component').then(m => m.AccountMessagesComponent),
    pathMatch: 'full',
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'account-messages' }
  },
  {
    path: PATH.ADD,
    loadComponent: () =>
      import('@account/account-messages/add-account-message/add-account-message.component').then(m => m.AddAccountMessageComponent),
    canActivate: [isActivePendingGuard],
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'add-account-message' }
  },
  {
    path: PATH.MESSAGE_HISTORY,
    loadComponent: () =>
      import('@account/account-messages/account-message-history/account-message-history.component').then(m => m.AccountMessageHistoryComponent),
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'account-message-history' }
  }
];
