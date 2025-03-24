import { Routes } from '@angular/router';
import { analyticsResolver } from '@core/resolvers';

export enum PATH {
  EMPTY = '',
  ADD = 'add'
}

export const ROUTES: Routes = [
  {
    path: PATH.EMPTY,
    loadComponent: () => import('@dashboard/ecommerce/ecommerce.component').then(m => m.EcommerceComponent),
    pathMatch: 'full',
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'ecommerce' }
  },
  {
    path: PATH.ADD,
    loadComponent: () =>
      import('@dashboard/ecommerce/add-ecommerce-product/add-ecommerce-product.component').then(m => m.AddEcommerceProductComponent),
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'add-ecommerce-product' }
  },
  {
    path: ':productId',
    loadComponent: () =>
      import('@dashboard/ecommerce/edit-ecommerce-product/edit-ecommerce-product.component').then(m => m.EditEcommerceProductComponent),
    resolve: { data: analyticsResolver },
    data: { pageViewEventName: 'edit-ecommerce-product' }
  }
];
