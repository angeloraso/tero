import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { configGuard } from '@core/guards';
import { ConfigComponent } from './config.component';

export enum PATH {
  EMPTY = '',
  USERS = 'users',
  GARBAGE_HISTORY = 'garbage-history'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: ConfigComponent,
    pathMatch: 'full'
  },
  {
    path: PATH.USERS,
    loadChildren: () => import('@config/users/users.module').then(m => m.UsersModule),
    canActivate: [configGuard]
  },
  {
    path: PATH.GARBAGE_HISTORY,
    loadChildren: () =>
      import('@config/garbage-history/garbage-history.module').then(m => m.GarbageHistoryModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigRoutingModule {
  static COMPONENTS: Array<any> = [ConfigComponent];
}
