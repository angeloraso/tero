import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard, autoSignInGuard } from '@core/guards';

export enum PATH {
  EMPTY = '',
  HOME = 'home',
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
    canLoad: [autoSignInGuard],
    canActivate: [autoSignInGuard]
  },
  {
    path: PATH.HOME,
    loadChildren: () => import('@home/home.module').then(m => m.HomeModule),
    canLoad: [authGuard]
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
