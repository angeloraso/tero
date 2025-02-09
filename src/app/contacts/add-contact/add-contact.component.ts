import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '@auth/auth.service';
import { BizyLogService, BizyRouterService, BizyToastService } from '@bizy/services';
import { IContact } from '@core/model';
import { ContactsService } from '@core/services';

@Component({
  selector: 'tero-add-contact',
  templateUrl: './add-contact.html',
  styleUrls: ['./add-contact.css']
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
    this.router.goBack();
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
