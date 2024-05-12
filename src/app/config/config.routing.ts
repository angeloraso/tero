import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { configGuard } from '@core/guards';
import { ConfigComponent } from './config.component';
import { PendingUsersComponent } from './pending-users/pending-users.component';

export enum PATH {
  EMPTY = '',
  PENDING_USERS = 'pending'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: ConfigComponent,
    pathMatch: 'full'
  },
  {
    path: PATH.PENDING_USERS,
    component: PendingUsersComponent,
    canActivate: [configGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigRoutingModule {
  static COMPONENTS: Array<any> = [ConfigComponent, PendingUsersComponent];
}
