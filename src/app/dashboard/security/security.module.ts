import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { ImageModule } from '@components/image';
import { SharedModule } from '@shared/shared.module';
import { RegisterPaymentPopupComponent } from './components';
import { es } from './i18n';
import { SecurityRoutingModule } from './security.routing';

const COMPONENTS: Array<any> = [RegisterPaymentPopupComponent];
@NgModule({
  imports: [SharedModule, SecurityRoutingModule, ImageModule],
  declarations: SecurityRoutingModule.COMPONENTS.concat(COMPONENTS)
})
export class SecurityModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
