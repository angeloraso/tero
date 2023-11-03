import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';

export enum PATH {
  EMPTY = '',
  DASHBOARD = 'dashboard',
  NEIGHBORHOOD = 'neighborhood',
  MAP = 'map',
  CONTACTS = 'contacts',
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
        loadChildren: () => import('@dashboard/dashboard.module').then(m => m.DashboardModule)
      },
      {
        path: PATH.NEIGHBORHOOD,
        loadChildren: () =>
          import('@neighborhood/neighborhood.module').then(m => m.NeighborhoodModule)
      },
      {
        path: PATH.MAP,
        loadChildren: () => import('@map/map.module').then(m => m.MapModule)
      },
      {
        path: PATH.CONTACTS,
        loadChildren: () => import('@contacts/contacts.module').then(m => m.ContactsModule)
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
