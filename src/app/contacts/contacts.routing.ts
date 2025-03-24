import { Routes } from '@angular/router';
import { neighborGuard } from '@core/guards';
import { analyticsResolver } from '@core/resolvers';

export enum PATH {
  EMPTY = '',
  ADD = 'add'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@contacts/contacts.component').then(m => m.ContactsComponent),
    pathMatch: 'full',
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'contacts' }
  },
  {
    path: PATH.ADD,
    loadComponent: () => import('@contacts/add-contact/add-contact.component').then(m => m.AddContactComponent),
    canActivate: [neighborGuard],
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'add-contact' }
  },
  {
    path: ':contactId',
    loadComponent: () => import('@contacts/edit-contact/edit-contact.component').then(m => m.EditContactComponent),
    canActivate: [neighborGuard],
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'edit-contact' }
  }
];
