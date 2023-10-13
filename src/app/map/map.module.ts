import { Inject, NgModule } from '@angular/core';
import { TeroTranslateService } from '@core/services';
import { SharedModule } from '@shared/shared.module';
import { LotComponent, LotPopupComponent } from './components';
import { es } from './i18n';
import { MapRoutingModule } from './map.routing';

const COMPONENTS: Array<any> = [LotComponent, LotPopupComponent];

@NgModule({
  imports: [SharedModule, MapRoutingModule],
  declarations: MapRoutingModule.COMPONENTS.concat(COMPONENTS)
})
export class MapModule {
  constructor(@Inject(TeroTranslateService) private translate: TeroTranslateService) {
    this.translate.loadTranslations(es);
  }
}
