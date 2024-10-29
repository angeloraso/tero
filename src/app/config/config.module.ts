import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { ImageModule } from '@components/image';
import { SharedModule } from '@shared/shared.module';
import { AboutPopupComponent, UserLotPopupComponent, UserPhonePopupComponent } from './components';
import { ConfigRoutingModule } from './config.routing';
import { es } from './i18n';

const COMPONENTS: Array<any> = [
  AboutPopupComponent,
  UserPhonePopupComponent,
  UserLotPopupComponent
];
@NgModule({
  imports: [SharedModule, ConfigRoutingModule, ImageModule],
  declarations: ConfigRoutingModule.COMPONENTS.concat(COMPONENTS)
})
export class ConfigModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
