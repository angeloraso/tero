import { Inject, NgModule } from '@angular/core';
import { ConfirmAlertModule } from '@components/confirm-alert';
import { ConfirmFooterModule } from '@components/confirm-footer';
import { ImageModule } from '@components/image';
import { TeroTranslateService } from '@core/services';
import { SharedModule } from '@shared/shared.module';
import { NeighborFormComponent } from './components';
import { es } from './i18n';
import { NeighborhoodRoutingModule } from './neighborhood.routing';
import { NeighborhoodService } from './neighborhood.service';

const COMPONENTS: Array<any> = [NeighborFormComponent];
@NgModule({
  imports: [
    SharedModule,
    NeighborhoodRoutingModule,
    ConfirmAlertModule,
    ConfirmFooterModule,
    ImageModule
  ],
  declarations: NeighborhoodRoutingModule.COMPONENTS.concat(COMPONENTS),
  providers: [NeighborhoodService]
})
export class NeighborhoodModule {
  constructor(@Inject(TeroTranslateService) private translate: TeroTranslateService) {
    this.translate.loadTranslations(es);
  }
}
