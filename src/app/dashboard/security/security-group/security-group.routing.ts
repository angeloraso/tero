import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecurityGroupInvoicesComponent } from './security-group-invoices/security-group-invoices.component';
import { SecurityGroupComponent } from './security-group.component';

export enum PATH {
  EMPTY = '',
  INVOICES = 'invoices'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: SecurityGroupComponent,
    pathMatch: 'full'
  },
  {
    path: PATH.INVOICES,
    component: SecurityGroupInvoicesComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityGroupRoutingModule {
  static COMPONENTS = [SecurityGroupComponent, SecurityGroupInvoicesComponent];
}
