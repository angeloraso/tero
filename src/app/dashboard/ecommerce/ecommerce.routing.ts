import { Routes } from '@angular/router';

export enum PATH {
  EMPTY = '',
  ADD = 'add'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@dashboard/ecommerce/ecommerce.component').then(m => m.EcommerceComponent),
    pathMatch: 'full'
  },
  {
    path: PATH.ADD,
    loadComponent: () => import('@dashboard/ecommerce/add-ecommerce-product/add-ecommerce-product.component').then(m => m.AddEcommerceProductComponent),
  },
  {
    path: ':productId',
    loadComponent: () => import('@dashboard/ecommerce/edit-ecommerce-product/edit-ecommerce-product.component').then(m => m.EditEcommerceProductComponent),
  }
];
