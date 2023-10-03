import { NgModule } from '@angular/core';
import { DashboardModule } from '@app/dashboard/dashboard.module';
import { NeighborhoodModule } from '@neighborhood/neighborhood.module';
import { SharedModule } from '@shared/shared.module';
import { HomeRoutingModule } from './home.routing';

@NgModule({
  imports: [SharedModule, HomeRoutingModule, DashboardModule, NeighborhoodModule],
  declarations: [HomeRoutingModule.COMPONENTS]
})
export class HomeModule {}
