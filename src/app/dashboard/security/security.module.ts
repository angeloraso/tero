import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { SharedModule } from '@shared/shared.module';
import { es } from './i18n';
import { SecurityRoutingModule } from './security.routing';

@NgModule({
  imports: [SharedModule, SecurityRoutingModule],
  declarations: SecurityRoutingModule.COMPONENTS
})
export class SecurityModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
