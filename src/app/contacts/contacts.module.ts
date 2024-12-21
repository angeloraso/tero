import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { SharedModule } from '@shared/shared.module';
import {
  ContactFormComponent,
  RatingHistoryPopupComponent,
  RatingPopupComponent
} from './components';
import { ContactsRoutingModule } from './contacts.routing';
import { es } from './i18n';

const COMPONENTS: Array<any> = [
  ContactFormComponent,
  RatingPopupComponent,
  RatingHistoryPopupComponent
];
@NgModule({
  imports: [SharedModule, ContactsRoutingModule],
  declarations: ContactsRoutingModule.COMPONENTS.concat(COMPONENTS)
})
export class ContactsModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
