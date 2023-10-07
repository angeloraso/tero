import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddNeighborComponent } from './add-neighbor/add-neighbor.component';
import { EditNeighborComponent } from './edit-neighbor/edit-neighbor.component';
import { NeighborhoodComponent } from './neighborhood.component';

export enum PATH {
  EMPTY = '',
  ADD = 'add'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: NeighborhoodComponent,
    pathMatch: 'full'
  },
  {
    path: PATH.ADD,
    component: AddNeighborComponent
  },
  {
    path: ':neighborId',
    component: EditNeighborComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NeighborhoodRoutingModule {
  static COMPONENTS = [NeighborhoodComponent, AddNeighborComponent, EditNeighborComponent];
}
