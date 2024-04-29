import { Inject, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BizyTranslateService } from '@bizy/services';
import { SharedModule } from '@shared/shared.module';
import { AuthRoutingModule } from './auth.routing';
import { es } from './i18n';

@NgModule({
  imports: [SharedModule, AuthRoutingModule, ReactiveFormsModule],
  declarations: [AuthRoutingModule.COMPONENTS]
})
export class AuthModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
