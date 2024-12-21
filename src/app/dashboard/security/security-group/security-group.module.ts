import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { SharedModule } from '@shared/shared.module';
import { RegisterPaymentPopupComponent } from './components';
import { es } from './i18n';
import { SecurityGroupRoutingModule } from './security-group.routing';

const COMPONENTS: Array<any> = [RegisterPaymentPopupComponent];
@NgModule({
  imports: [SharedModule, SecurityGroupRoutingModule],
  declarations: SecurityGroupRoutingModule.COMPONENTS.concat(COMPONENTS)
})
export class SecurityGroupModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
