import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { ImageModule } from '@components/image';
import { SharedModule } from '@shared/shared.module';
import { es } from './i18n';
import { UsersRoutingModule } from './users.routing';

@NgModule({
  imports: [SharedModule, UsersRoutingModule, ImageModule],
  declarations: UsersRoutingModule.COMPONENTS
})
export class UsersModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}