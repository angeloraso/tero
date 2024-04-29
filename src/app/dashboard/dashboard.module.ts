import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { SharedModule } from '@shared/shared.module';
import { DashboardRoutingModule } from './dashboard.routing';
import { es } from './i18n';

@NgModule({
  imports: [SharedModule, DashboardRoutingModule],
  declarations: DashboardRoutingModule.COMPONENTS
})
export class DashboardModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
