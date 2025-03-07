import { Routes } from '@angular/router';
import { neighborGuard } from '@core/guards';

export enum PATH {
  EMPTY = '',
  ADD = 'add'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@contacts/contacts.component').then(m => m.ContactsComponent),
    pathMatch: 'full'
  },
  {
    path: PATH.ADD,
    loadComponent: () => import('@contacts/add-contact/add-contact.component').then(m => m.AddContactComponent),
    canActivate: [neighborGuard]
  },
  {
    path: ':contactId',
    loadComponent: () => import('@contacts/edit-contact/edit-contact.component').then(m => m.EditContactComponent),
    canActivate: [neighborGuard]
  }
];
