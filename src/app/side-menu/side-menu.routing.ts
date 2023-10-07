import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SideMenuComponent } from './side-menu.component';

export enum PATH {
  EMPTY = '',
  HOME = 'home'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: SideMenuComponent,
    children: [
      {
        path: PATH.EMPTY,
        redirectTo: PATH.HOME,
        pathMatch: 'full'
      },
      {
        path: PATH.HOME,
        loadChildren: () => import('@home/home.module').then(m => m.HomeModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SideMenuRoutingModule {
  static COMPONENTS = [SideMenuComponent];
}
