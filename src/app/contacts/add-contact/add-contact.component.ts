import { Component, Inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import { BizyLogService, BizyRouterService, BizyToastService } from '@bizy/core';
import { ContactFormComponent } from '@contacts/components';
import { IContact } from '@core/model';
import { ContactsService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';

@Component({
    selector: 'tero-add-contact',
    templateUrl: './add-contact.html',
    styleUrls: ['./add-contact.css'],
    imports: [...SharedModules, ContactFormComponent]
})
export class AddContactComponent implements OnInit {
  loading: boolean = false;
  tags: Array<string> = [];

  constructor(
    @Inject(ContactsService) private contacts: ContactsService,
    @Inject(AuthService) private auth: AuthService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyLogService) private log: BizyLogService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.tags = await this.contacts.getTags();
    } catch (error) {
      this.log.error({
        fileName: 'add-contact.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }

  goBack() {
    this.router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.CONTACTS}` });
  }

  async save(contact: IContact) {
    try {
      if (!contact || this.loading) {
        return;
      }

      this.loading = true;
      const accountId = await this.auth.getId();
      if (!accountId) {
        throw new Error();
      }

      await this.contacts.postContact({ ...contact, accountId });
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
