import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { IContact } from '@core/model';
import { ContactsService } from '@core/services';
import { PopupComponent } from '@shared/components';

@Component({
  selector: 'tero-edit-contact',
  templateUrl: './edit-contact.html',
  styleUrls: ['./edit-contact.css']
})
export class EditContactComponent implements OnInit {
  contact: IContact | null = null;
  contactId: string | null = null;
  loading = false;
  tags: Array<string> = [];

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(ContactsService) private contactsService: ContactsService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(ActivatedRoute) private activatedRoute: ActivatedRoute,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.contactId = this.router.getId(this.activatedRoute, 'contactId');
      if (!this.contactId) {
        this.goBack();
        return;
      }

      const [contact, tags] = await Promise.all([
        this.contactsService.getContact(this.contactId),
        this.contactsService.getTags()
      ]);
      this.contact = contact;
      this.tags = tags;
    } catch (error) {
      this.log.error({
        fileName: 'edit-contact.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }

  deleteContact = () => {
    if (!this.contact || this.loading) {
      return;
    }

    this.popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.translate.get('CONTACTS.EDIT_CONTACT.DELETE_POPUP.TITLE'),
          msg: `${this.translate.get('CONTACTS.EDIT_CONTACT.DELETE_POPUP.MSG')}: ${this.contact.surname} ${this.contact.name}`
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            await this.contactsService.deleteContact(this.contact as IContact);
            this.goBack();
          }
        } catch (error) {
          this.log.error({
            fileName: 'edit-contact.component',
            functionName: 'deleteContact',
            param: error
          });
          this.toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  };

  goBack() {
    this.router.goBack();
  }

  async save(contact: IContact) {
    try {
      if (!contact) {
        return;
      }

      this.loading = true;
      await this.contactsService.putContact(contact);
      this.goBack();
    } catch (error) {
      this.log.error({
        fileName: 'edit-contact.component',
        functionName: 'save',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
