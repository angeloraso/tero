import { inject, NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { UsersService } from '@core/services';
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
    component: SecurityInvoicesComponent,
    canMatch: [
      () => {
        const router = inject(Router);
        const usersService = inject(UsersService);
        return Promise.all([usersService.isNeighbor(), usersService.isSecurity()]).then(
          ([isNeighbor, isSecurity]) => {
            if (!isNeighbor && !isSecurity) {
              router.navigateByUrl('/', { replaceUrl: true });
              console.error('Role error: User has not security or neighbor role');
              return false;
            }

            return true;
          }
        );
      }
    ]
  },
  {
    path: ':group',
    loadChildren: () =>
      import('@dashboard/security/security-group/security-group.module').then(
        m => m.SecurityGroupModule
      )
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SecurityRoutingModule {
  static COMPONENTS = [SecurityComponent, SecurityInvoicesComponent];
}
