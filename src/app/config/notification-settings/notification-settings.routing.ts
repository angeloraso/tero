import { Routes } from '@angular/router';
import { neighborGuard } from '@core/guards';
import { analyticsResolver } from '@core/resolvers';

export enum PATH {
  EMPTY = ''
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@config/notification-settings/notification-settings.component').then(m => m.NotificationSettingsComponent),
    pathMatch: 'full',
    canActivate: [neighborGuard],
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'notification-settings' }
  }
];
