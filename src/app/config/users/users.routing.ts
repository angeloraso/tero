import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { configGuard } from '@core/guards';
import { EditUserComponent } from './edit-user/edit-user.component';
import { UsersComponent } from './users.component';

export enum PATH {
  EMPTY = ''
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: UsersComponent,
    pathMatch: 'full'
  },
  {
    path: ':userEmail',
    component: EditUserComponent,
    canActivate: [configGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule {
  static COMPONENTS: Array<any> = [UsersComponent, EditUserComponent];
}
