import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GarbageHistoryComponent } from './garbage-history.component';

export enum PATH {
  EMPTY = ''
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: GarbageHistoryComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GarbageHistoryRoutingModule {
  static COMPONENTS: Array<any> = [GarbageHistoryComponent];
}
