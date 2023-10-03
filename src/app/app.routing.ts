import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authCanLoadGuard, autoLoginCanLoadGuard } from '@core/guards';

export enum PATH {
  EMPTY = '',
  MENU = '-',
  AUTH = 'auth',
  ANY = '**'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    redirectTo: PATH.AUTH,
    pathMatch: 'full'
  },
  {
    path: PATH.AUTH,
    loadChildren: () => import('@auth/auth.module').then(m => m.AuthModule),
    canLoad: [autoLoginCanLoadGuard]
  },
  {
    path: PATH.MENU,
    loadChildren: () => import('@menu/side-menu.module').then(m => m.SideMenuModule),
    canLoad: [authCanLoadGuard]
  },
  {
    path: PATH.ANY,
    redirectTo: PATH.AUTH
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
