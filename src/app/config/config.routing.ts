import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authCanActivateGuard } from '@core/guards';
import { ConfigComponent } from './config.component';

export enum PATH {
  EMPTY = ''
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: ConfigComponent,
    pathMatch: 'full',
    canActivate: [authCanActivateGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigRoutingModule {
  static COMPONENTS: Array<any> = [ConfigComponent];
}
