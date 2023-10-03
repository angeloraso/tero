import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from '@dashboard/dashboard.component';
import { NeighborhoodComponent } from '@neighborhood/neighborhood.component';
import { HomeComponent } from './home.component';

export enum PATH {
  EMPTY = '',
  DASHBOARD = 'dashboard',
  NEIGHBORHOOD = 'neighborhood',
  ANY = '**'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: HomeComponent,
    children: [
      {
        path: PATH.EMPTY,
        redirectTo: PATH.DASHBOARD,
        pathMatch: 'full'
      },
      {
        path: PATH.DASHBOARD,
        component: DashboardComponent
      },
      {
        path: PATH.NEIGHBORHOOD,
        component: NeighborhoodComponent
      },
      {
        path: PATH.ANY,
        redirectTo: PATH.DASHBOARD
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
