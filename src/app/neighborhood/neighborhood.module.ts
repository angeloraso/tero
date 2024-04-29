import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { SharedModule } from '@shared/shared.module';
import { LotComponent, LotPopupComponent } from './components';
import { es } from './i18n';
import { NeighborhoodRoutingModule } from './neighborhood.routing';

const COMPONENTS: Array<any> = [LotComponent, LotPopupComponent];

@NgModule({
  imports: [SharedModule, NeighborhoodRoutingModule],
  declarations: NeighborhoodRoutingModule.COMPONENTS.concat(COMPONENTS)
})
export class NeighborhoodModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
