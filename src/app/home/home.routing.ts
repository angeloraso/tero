import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from '@core/guards';
import { HomeComponent } from './home.component';

export enum PATH {
  EMPTY = '',
  NEIGHBORS = 'neighbors',
  DASHBOARD = 'dashboard',
  NEIGHBORHOOD = 'neighborhood',
  CONTACTS = 'contacts',
  CONFIG = 'config',
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
        path: PATH.NEIGHBORS,
        loadChildren: () => import('@neighbors/neighbors.module').then(m => m.NeighborsModule),
        canActivate: [authGuard]
      },
      {
        path: PATH.NEIGHBORHOOD,
        loadChildren: () =>
          import('@neighborhood/neighborhood.module').then(m => m.NeighborhoodModule),
        canActivate: [authGuard]
      },
      {
        path: PATH.DASHBOARD,
        loadChildren: () => import('@dashboard/dashboard.module').then(m => m.DashboardModule),
        canActivate: [authGuard]
      },
      {
        path: PATH.CONTACTS,
        loadChildren: () => import('@contacts/contacts.module').then(m => m.ContactsModule),
        canActivate: [authGuard]
      },
      {
        path: PATH.CONFIG,
        loadChildren: () => import('@config/config.module').then(m => m.ConfigModule),
        canActivate: [authGuard]
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
