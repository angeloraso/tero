import { NgModule } from '@angular/core';
import { ConfirmAlertModule } from '@components/confirm-alert';
import { ConfirmFooterModule } from '@components/confirm-footer';
import { SharedModule } from '@shared/shared.module';
import { NeighborFormComponent } from './components';
import { NeighborhoodRoutingModule } from './neighborhood.routing';
import { NeighborhoodService } from './neighborhood.service';

const COMPONENTS: Array<any> = [NeighborFormComponent];
@NgModule({
  imports: [SharedModule, NeighborhoodRoutingModule, ConfirmAlertModule, ConfirmFooterModule],
  declarations: NeighborhoodRoutingModule.COMPONENTS.concat(COMPONENTS),
  providers: [NeighborhoodService]
})
export class NeighborhoodModule {}
