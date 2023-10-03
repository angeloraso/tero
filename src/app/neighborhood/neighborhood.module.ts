import { NgModule } from '@angular/core';
import { ConfirmAlertModule } from '@components/confirm-alert';
import { SharedModule } from '@shared/shared.module';
import { NeighborhoodRoutingModule } from './neighborhood.routing';
import { NeighborhoodService } from './neighborhood.service';

@NgModule({
  imports: [SharedModule, NeighborhoodRoutingModule, ConfirmAlertModule],
  declarations: [NeighborhoodRoutingModule.COMPONENTS],
  exports: [NeighborhoodRoutingModule.COMPONENTS],
  providers: [NeighborhoodService]
})
export class NeighborhoodModule {}
