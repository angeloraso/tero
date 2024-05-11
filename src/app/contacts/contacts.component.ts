import { Component, Inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { BizyOrderByPipe, BizySearchPipe } from '@bizy/pipes';
import {
  BizyCopyToClipboardService,
  BizyExportToCSVService,
  BizyLogService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { PATH as CONTACTS_PATH } from '@contacts/contacts.routing';
import { DEFAULT_PICTURE, LOGO_PATH, WHATSAPP_URL } from '@core/constants';
import { IContact } from '@core/model';
import { ContactsService, MobileService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';

interface IContactCard extends IContact {
  _phones: Array<string>;
  _tags: Array<string>;
}

@Component({
  selector: 'tero-contacts',
  templateUrl: './contacts.html',
  styleUrls: ['./contacts.css']
})
export class ContactsComponent implements OnInit {
  loading = false;
  securityLoading = false;
  contacts: Array<IContactCard> = [];
  search: string | number = '';
  order: 'asc' | 'desc' = 'asc';
  orderBy = 'name';

  readonly LOGO_PATH = LOGO_PATH;
  readonly DEFAULT_PICTURE = DEFAULT_PICTURE;

  constructor(
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(ContactsService) private contactsService: ContactsService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService,
    @Inject(MobileService) private mobile: MobileService,
    @Inject(BizyExportToCSVService) private exportToCSV: BizyExportToCSVService,
    @Inject(BizyCopyToClipboardService) private bizyToClipboard: BizyCopyToClipboardService,
    @Inject(BizySearchPipe) private bizySearchPipe: BizySearchPipe,
    @Inject(BizyOrderByPipe) private bizyOrderByPipe: BizyOrderByPipe
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      const contacts = (await this.contactsService.getContacts()) ?? [];
      this.contacts = contacts.map(_contact => {
        return {
          ..._contact,
          _tags: _contact.tags.map(_tag => this.translate.get(`CONTACTS.TAG.${_tag}`)),
          _phones: _contact.phones.map(_phone => _phone.number)
        };
      });
    } catch (error) {
      this.log.error({
        fileName: 'contacts.component',
        functionName: 'ngOnInit',
        param: error
      });
    } finally {
      this.loading = false;
    }
  }

  addContact() {
    this.router.goTo({ path: `/${APP_PATH.HOME}/${HOME_PATH.CONTACTS}/${CONTACTS_PATH.ADD}` });
  }

  editContact(contact: IContactCard) {
    if (!contact) {
      return;
    }

    this.router.goTo({ path: `/${APP_PATH.HOME}/${HOME_PATH.CONTACTS}/${contact.id}` });
  }

  async copyPhone(phone: string) {
    try {
      await this.bizyToClipboard.copy(phone);
      this.toast.success();
    } catch (error) {
      this.log.error({
        fileName: 'contacts.component',
        functionName: 'copyPhone',
        param: error
      });
      this.toast.danger();
    }
  }

  async onCall(contact: IContactCard) {
    try {
      if (!contact.phones[0]) {
        return;
      }

      await this.mobile.call(contact.phones[0].number);
    } catch (error) {
      this.toast.danger();
    }
  }

  onWhatsapp(contact: IContactCard) {
    if (!contact.phones[0]) {
      return;
    }

    window.open(`${WHATSAPP_URL}${contact.phones[0].number}`, '_blank');
  }

  export() {
    if (!this.contacts || this.contacts.length === 0) {
      return;
    }

    const items = this.#filter(this.contacts);

    this.exportToCSV.toCSV({
      items,
      model: {
        name: this.translate.get('CORE.FORM.FIELD.NAME'),
        surname: this.translate.get('CORE.FORM.FIELD.SURNAME'),
        _phones: this.translate.get('CORE.FORM.FIELD.PHONE'),
        _tags: this.translate.get('CORE.FORM.FIELD.TAG')
      },
      fileName: this.translate.get('CONTACTS.CSV_FILE_NAME')
    });
  }

  #filter(items: Array<IContact>): Array<IContact> {
    let _items = this.bizySearchPipe.transform(items, this.search, [
      'name',
      '_tags',
      'surname',
      'score',
      '_phones'
    ]);
    _items = this.bizyOrderByPipe.transform(_items, this.order, this.orderBy);
    return _items;
  }
}
