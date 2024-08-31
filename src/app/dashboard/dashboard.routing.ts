import { inject, NgModule } from '@angular/core';
import { Router, RouterModule, Routes } from '@angular/router';
import { UserSettingsService } from '@core/services';
import { DashboardComponent } from './dashboard.component';

export enum PATH {
  EMPTY = '',
  SECURITY = 'security'
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
    canActivate: [
      () => {
        const router = inject(Router);
        const userSettings = inject(UserSettingsService);
        return Promise.all([userSettings.isNeighbor(), userSettings.isSecurity()]).then(
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule {
  static COMPONENTS = [DashboardComponent];
}
