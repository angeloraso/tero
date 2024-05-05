import { Component, Inject } from '@angular/core';
import { BizyLogService, BizyRouterService, BizyToastService } from '@bizy/services';
import { LOGO_PATH } from '@core/constants';
import { IContact } from '@core/model';
import { ContactsService } from '@core/services';

@Component({
  selector: 'tero-add-contact',
  templateUrl: './add-contact.html',
  styleUrls: ['./add-contact.css']
})
export class AddContactComponent {
  loading: boolean = false;
  readonly LOGO_PATH = LOGO_PATH;

  constructor(
    @Inject(ContactsService) private contacts: ContactsService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyLogService) private log: BizyLogService
  ) {}

  goBack() {
    this.router.goBack();
  }

  async save(contact: IContact) {
    try {
      if (!contact || this.loading) {
        return;
      }

      this.loading = true;
      await this.contacts.postContact(contact);
      this.goBack();
    } catch (error) {
      this.log.error({
        fileName: 'add-contact.component',
        functionName: 'save',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
