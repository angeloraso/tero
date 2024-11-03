import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecurityGroupComponent } from './security-group/security-group.component';
import { SecurityInvoicesComponent } from './security-invoices/security-invoices.component';
import { SecurityComponent } from './security.component';

export enum PATH {
  EMPTY = '',
  INVOICES = 'invoices'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: SecurityComponent,
    pathMatch: 'full'
  },
  {
    path: PATH.INVOICES,
    component: SecurityInvoicesComponent
  },
  {
    path: ':group',
    component: SecurityGroupComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule {
  static COMPONENTS = [SecurityComponent, SecurityGroupComponent, SecurityInvoicesComponent];
}
