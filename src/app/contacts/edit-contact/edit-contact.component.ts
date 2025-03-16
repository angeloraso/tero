import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import {
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { ContactFormComponent } from '@contacts/components';
import { IContact } from '@core/model';
import { ContactsService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';

@Component({
    selector: 'tero-edit-contact',
    templateUrl: './edit-contact.html',
    styleUrls: ['./edit-contact.css'],
    imports: [...SharedModules, ContactFormComponent]
})
export class EditContactComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #contactsService = inject(ContactsService);
  readonly #router = inject(BizyRouterService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #translate = inject(BizyTranslateService);
  readonly #auth = inject(AuthService);

  contact: IContact | null = null;
  contactId: string | null = null;
  loading = false;
  tags: Array<string> = [];

  async ngOnInit() {
    try {
      this.loading = true;
      this.contactId = this.#router.getId(this.#activatedRoute, 'contactId');
      if (!this.contactId) {
        this.goBack();
        return;
      }

      const [contact, tags] = await Promise.all([
        this.#contactsService.getContact(this.contactId),
        this.#contactsService.getTags()
      ]);
      this.contact = contact;
      this.tags = tags;
    } catch (error) {
      this.#log.error({
        fileName: 'edit-contact.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  deleteContact = () => {
    if (!this.contact || this.loading) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('CONTACTS.EDIT_CONTACT.DELETE_POPUP.TITLE'),
          msg: `${this.#translate.get('CONTACTS.EDIT_CONTACT.DELETE_POPUP.MSG')}: ${this.contact.surname} ${this.contact.name}`
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            await this.#contactsService.deleteContact(this.contact as IContact);
            this.goBack();
          }
        } catch (error) {
          this.#log.error({
            fileName: 'edit-contact.component',
            functionName: 'deleteContact',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  };

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.CONTACTS}` });
  }

  async save(contact: IContact) {
    try {
      if (!contact) {
        return;
      }

      this.loading = true;

      if (!contact.accountId) {
        const accountId = await this.#auth.getId();
        if (!accountId) {
          throw new Error();
        }

        contact.accountId = accountId;
      }

      await this.#contactsService.putContact(contact);
      this.goBack();
    } catch (error) {
      this.#log.error({
        fileName: 'edit-contact.component',
        functionName: 'save',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
