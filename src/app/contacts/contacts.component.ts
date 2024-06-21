import { Component, Inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { BIZY_TAG_TYPE } from '@bizy/components';
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
import { LOGO_PATH, WHATSAPP_URL } from '@core/constants';
import { IContact } from '@core/model';
import { ContactsService, MobileService, UserSettingsService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';

interface IContactCard extends IContact {
  _phones: Array<string>;
}

@Component({
  selector: 'tero-contacts',
  templateUrl: './contacts.html',
  styleUrls: ['./contacts.css']
})
export class ContactsComponent implements OnInit {
  loading = false;
  csvLoading = false;
  isNeighbor = false;
  isConfig = false;
  securityLoading = false;
  contacts: Array<IContactCard> = [];
  search: string | number = '';
  order: 'asc' | 'desc' | null = 'asc';
  orderBy = 'name';

  readonly LOGO_PATH = LOGO_PATH;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;

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
    @Inject(BizyOrderByPipe) private bizyOrderByPipe: BizyOrderByPipe,
    @Inject(UserSettingsService) private userSettingsService: UserSettingsService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      const [contacts, isConfig, isNeighbor] = await Promise.all([
        this.contactsService.getContacts(),
        this.userSettingsService.isConfig(),
        this.userSettingsService.isNeighbor()
      ]);

      this.isConfig = isConfig;
      this.isNeighbor = isNeighbor;

      this.contacts = contacts.map(_contact => {
        return {
          ..._contact,
          _phones: _contact.phones.map(_phone => _phone.number)
        };
      });
    } catch (error) {
      this.log.error({
        fileName: 'contacts.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
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

  async export() {
    try {
      if (!this.contacts || this.contacts.length === 0) {
        return;
      }

      const items = this.#filter(this.contacts);

      const fileName = this.translate.get('CONTACTS.CSV_FILE_NAME');
      const model = {
        name: this.translate.get('CORE.FORM.FIELD.NAME'),
        surname: this.translate.get('CORE.FORM.FIELD.SURNAME'),
        _phones: this.translate.get('CORE.FORM.FIELD.PHONE'),
        tags: this.translate.get('CORE.FORM.FIELD.TAG')
      };

      if (this.mobile.isMobile()) {
        const csv = this.exportToCSV.getCSV({ items, model });
        await this.mobile.downloadFile({ data: csv, name: fileName });
      } else {
        this.exportToCSV.download({ items, model, fileName });
      }
    } catch (error) {
      this.log.error({
        fileName: 'contacts.component',
        functionName: 'export',
        param: error
      });
      this.toast.danger({
        title: 'Error',
        msg: `${this.translate.get('CORE.FORM.ERROR.APP')}: Excel, Spreadsheet, etc`
      });
    } finally {
      this.csvLoading = false;
    }
  }

  #filter(items: Array<IContact>): Array<IContact> {
    let _items = this.bizySearchPipe.transform(items, this.search, [
      'name',
      'tags',
      'surname',
      'score',
      '_phones'
    ]);
    _items = this.bizyOrderByPipe.transform(_items, this.order, this.orderBy);
    return _items;
  }
}
