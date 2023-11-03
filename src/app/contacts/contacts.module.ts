import { Inject, NgModule } from '@angular/core';
import { ConfirmAlertModule } from '@components/confirm-alert';
import { ConfirmFooterModule } from '@components/confirm-footer';
import { ImageModule } from '@components/image';
import { TeroTranslateService } from '@core/services';
import { SharedModule } from '@shared/shared.module';
import { ContactFormComponent } from './components';
import { ContactsRoutingModule } from './contacts.routing';
import { es } from './i18n';

const COMPONENTS: Array<any> = [ContactFormComponent];
@NgModule({
  imports: [
    SharedModule,
    ContactsRoutingModule,
    ConfirmAlertModule,
    ConfirmFooterModule,
    ImageModule
  ],
  declarations: ContactsRoutingModule.COMPONENTS.concat(COMPONENTS)
})
export class ContactsModule {
  constructor(@Inject(TeroTranslateService) private translate: TeroTranslateService) {
    this.translate.loadTranslations(es);
  }
}
