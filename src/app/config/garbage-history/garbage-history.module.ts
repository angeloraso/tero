import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { SharedModule } from '@shared/shared.module';
import { GarbageHistoryRoutingModule } from './garbage-history.routing';
import { es } from './i18n';

@NgModule({
  imports: [SharedModule, GarbageHistoryRoutingModule],
  declarations: GarbageHistoryRoutingModule.COMPONENTS
})
export class GarbageHistoryModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
