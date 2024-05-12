import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { configGuard } from '@core/guards';
import { AddNeighborComponent } from './add-neighbor/add-neighbor.component';
import { EditNeighborComponent } from './edit-neighbor/edit-neighbor.component';
import { NeighborsComponent } from './neighbors.component';

export enum PATH {
  EMPTY = '',
  ADD = 'add'
}

const routes: Routes = [
  {
    path: PATH.EMPTY,
    component: NeighborsComponent,
    pathMatch: 'full'
  },
  {
    path: PATH.ADD,
    component: AddNeighborComponent,
    canActivate: [configGuard]
  },
  {
    path: ':neighborId',
    component: EditNeighborComponent,
    canActivate: [configGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NeighborsRoutingModule {
  static COMPONENTS = [NeighborsComponent, AddNeighborComponent, EditNeighborComponent];
}
