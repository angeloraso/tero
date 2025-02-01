import { inject, NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { UsersService } from '@core/services';
import { DashboardComponent } from './dashboard.component';

export enum PATH {
  EMPTY = '',
  SECURITY = 'security',
  ECOMMERCE = 'ecommerce',
  TOPICS = 'topics'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: DashboardComponent,
    pathMatch: 'full'
  },
  {
    path: PATH.SECURITY,
    loadChildren: () => import('@dashboard/security/security.module').then(m => m.SecurityModule),
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
    path: PATH.ECOMMERCE,
    loadChildren: () => import('@dashboard/ecommerce/ecommerce.module').then(m => m.EcommerceModule)
  },
  {
    path: PATH.TOPICS,
    loadChildren: () => import('@dashboard/topics/topics.module').then(m => m.TopicsModule),
    canMatch: [
      () => {
        const router = inject(Router);
        const usersService = inject(UsersService);
        return Promise.all([usersService.isNeighbor(), usersService.isConfig()]).then(
          ([isNeighbor, isConfig]) => {
            if (!isNeighbor && !isConfig) {
              router.navigateByUrl('/', { replaceUrl: true });
              console.error('Role error: User has not config or neighbor role');
              return false;
            }

            return true;
          }
        );
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
  static COMPONENTS = [DashboardComponent];
}
