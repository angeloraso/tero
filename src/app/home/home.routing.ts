import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';

export enum PATH {
  EMPTY = '',
  TABS = 'tabs',
  DASHBOARD = 'dashboard',
  NEIGHBORHOOD = 'neighboorhood',
  ANY = '**'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    pathMatch: 'full',
    redirectTo: PATH.TABS
  },
  {
    path: PATH.TABS,
    component: HomeComponent,
    children: [
      {
        path: PATH.EMPTY,
        redirectTo: PATH.DASHBOARD,
        pathMatch: 'full'
      },
      {
        path: PATH.DASHBOARD,
        loadChildren: () => import('@dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: PATH.NEIGHBORHOOD,
        loadChildren: () =>
          import('@neighborhood/neighborhood.module').then(m => m.NeighborhoodModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule {
  static COMPONENTS = [HomeComponent];
}
