import { Routes } from '@angular/router';

export enum PATH {
  EMPTY = '',
  INVOICES = 'invoices'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@dashboard/security/security-group/security-group.component').then(m => m.SecurityGroupComponent),
    pathMatch: 'full'
  },
  {
    path: PATH.INVOICES,
    loadComponent: () => import('@dashboard/security/security-group/security-group-invoices/security-group-invoices.component').then(m => m.SecurityGroupInvoicesComponent),
  }
];
