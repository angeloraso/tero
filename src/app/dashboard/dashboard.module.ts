import { Inject, NgModule } from '@angular/core';
import { TeroTranslateService } from '@core/services';
import { SharedModule } from '@shared/shared.module';
import { DashboardRoutingModule } from './dashboard.routing';
import { es } from './i18n';

@NgModule({
  imports: [SharedModule, DashboardRoutingModule],
  declarations: DashboardRoutingModule.COMPONENTS
})
export class DashboardModule {
  constructor(@Inject(TeroTranslateService) private translate: TeroTranslateService) {
    this.translate.loadTranslations(es);
  }
}
