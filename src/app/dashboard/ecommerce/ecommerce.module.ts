import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { ImageModule } from '@components/image';
import { SharedModule } from '@shared/shared.module';
import { EcommerceProductFormComponent } from './components';
import { EcommerceRoutingModule } from './ecommerce.routing';
import { es } from './i18n';

const COMPONENTS: Array<any> = [EcommerceProductFormComponent];
@NgModule({
  imports: [SharedModule, EcommerceRoutingModule, ImageModule],
  declarations: EcommerceRoutingModule.COMPONENTS.concat(COMPONENTS)
})
export class EcommerceModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
