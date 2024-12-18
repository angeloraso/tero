import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { configGuard } from '@core/guards';
import { ConfigComponent } from './config.component';

export enum PATH {
  EMPTY = '',
  USERS = 'users'
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
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigRoutingModule {
  static COMPONENTS: Array<any> = [ConfigComponent];
}
