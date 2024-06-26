import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NeighborhoodComponent } from './neighborhood.component';

export enum PATH {
  EMPTY = ''
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: NeighborhoodComponent,
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NeighborhoodRoutingModule {
  static COMPONENTS = [NeighborhoodComponent];
}
