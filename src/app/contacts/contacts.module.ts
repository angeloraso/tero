import { Inject, NgModule } from '@angular/core';
import { BizyTranslateService } from '@bizy/services';
import { ImageModule } from '@components/image';
import { SharedModule } from '@shared/shared.module';
import { ContactFormComponent } from './components';
import { ContactsRoutingModule } from './contacts.routing';
import { es } from './i18n';

const COMPONENTS: Array<any> = [ContactFormComponent];
@NgModule({
  imports: [SharedModule, ContactsRoutingModule, ImageModule],
  declarations: ContactsRoutingModule.COMPONENTS.concat(COMPONENTS)
})
export class ContactsModule {
  constructor(@Inject(BizyTranslateService) private translate: BizyTranslateService) {
    this.translate.loadTranslations(es);
  }
}
