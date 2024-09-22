import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEcommerceProductComponent } from './add-ecommerce-product/add-ecommerce-product.component';
import { EcommerceComponent } from './ecommerce.component';
import { EditEcommerceProductComponent } from './edit-ecommerce-product/edit-ecommerce-product.component';

export enum PATH {
  EMPTY = '',
  ADD = 'add'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: EcommerceComponent,
    pathMatch: 'full'
  },
  {
    path: PATH.ADD,
    component: AddEcommerceProductComponent
  },
  {
    path: ':productId',
    component: EditEcommerceProductComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcommerceRoutingModule {
  static COMPONENTS = [
    EcommerceComponent,
    AddEcommerceProductComponent,
    EditEcommerceProductComponent
  ];
}
