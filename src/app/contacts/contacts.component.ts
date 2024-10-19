import { Component, Inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { BIZY_TAG_TYPE, BizyFilterPipe } from '@bizy/components';
import { BizyOrderByPipe, BizySearchPipe } from '@bizy/pipes';
import {
  BizyCopyToClipboardService,
  BizyExportToCSVService,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { PATH as CONTACTS_PATH } from '@contacts/contacts.routing';
import { AuthService } from '@core/auth/auth.service';
import { LOGO_PATH, WHATSAPP_URL } from '@core/constants';
import { IContact, IContactRating } from '@core/model';
import { ContactsService, MobileService, UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { RatingHistoryPopupComponent, RatingPopupComponent } from './components';

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
  contacts: Array<IContactCard> = [];
  search: string | number = '';
  searchKeys = ['name', 'tags', 'surname', '_phones', 'score'];
  order: 'asc' | 'desc' = 'asc';
  orderBy = 'name';
  isMobile = true;
  filterTags: Array<{ id: string; value: string; selected: boolean }> = [];
  activatedFilters: number = 0;

  readonly LOGO_PATH = LOGO_PATH;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;

  constructor(
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(AuthService) private auth: AuthService,
    @Inject(ContactsService) private contactsService: ContactsService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService,
    @Inject(MobileService) private mobile: MobileService,
    @Inject(BizyExportToCSVService) private exportToCSV: BizyExportToCSVService,
    @Inject(BizyCopyToClipboardService) private bizyCopyToClipboard: BizyCopyToClipboardService,
    @Inject(BizySearchPipe) private bizySearchPipe: BizySearchPipe,
    @Inject(BizyOrderByPipe) private bizyOrderByPipe: BizyOrderByPipe,
    @Inject(BizyFilterPipe) private bizyFilterPipe: BizyFilterPipe,
    @Inject(UsersService) private usersService: UsersService,
    @Inject(BizyPopupService) private popup: BizyPopupService
  ) {
    this.isMobile = this.mobile.isMobile();
  }

  async ngOnInit() {
    try {
      this.loading = true;
      const [contacts, isConfig, isNeighbor] = await Promise.all([
        this.contactsService.getContacts(),
        this.usersService.isConfig(),
        this.usersService.isNeighbor()
      ]);

      this.isConfig = isConfig;
      this.isNeighbor = isNeighbor;

      const tags: Set<string> = new Set();

      this.contacts = contacts.map(_contact => {
        _contact.tags.forEach(_tag => {
          tags.add(_tag);
        });

        return {
          ..._contact,
          _phones: _contact.phones.map(_phone => _phone.number)
        };
      });
      this.filterTags = Array.from(tags).map(_tag => {
        return { id: _tag, value: _tag, selected: true };
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
    if (!this.isNeighbor) {
      return;
    }

    this.router.goTo({ path: `/${APP_PATH.HOME}/${HOME_PATH.CONTACTS}/${CONTACTS_PATH.ADD}` });
  }

  selectContact(contact: IContactCard) {
    if (!contact || !this.isNeighbor || contact.accountId !== this.auth.getId()) {
      return;
    }

    this.router.goTo({ path: `/${APP_PATH.HOME}/${HOME_PATH.CONTACTS}/${contact.id}` });
  }

  async openRatingPopup(contact: IContactCard) {
    if (!contact || !this.isNeighbor) {
      return;
    }

    const accountId = await this.auth.getId();
    if (!accountId) {
      return;
    }

    let value = null;
    let description = null;

    if (contact.rating && contact.rating.length > 0) {
      const contactRating = contact.rating.find(_rating => _rating.accountId === accountId);
      if (contactRating) {
        value = contactRating.value;
        description = contactRating.description;
      }
    }

    this.popup.open<IContactRating>(
      {
        component: RatingPopupComponent,
        data: {
          accountId,
          value,
          description
        }
      },
      async rating => {
        try {
          if (rating) {
            this.loading = true;
            if (contact.rating && contact.rating.length > 0) {
              const index = contact.rating.findIndex(
                _rating => _rating.accountId === rating.accountId
              );
              if (index !== -1) {
                contact.rating[index] = rating;
              } else {
                contact.rating.push(rating);
              }
            } else {
              contact.rating = [rating];
            }

            await this.contactsService.putContact(contact);
            const index = this.contacts.findIndex(_contact => _contact.id === contact.id);
            if (index !== -1) {
              this.contacts[index] = contact;
              this.contacts = [...this.contacts];
            }
          }
        } catch (error) {
          this.log.error({
            fileName: 'contacts.component',
            functionName: 'openRating',
            param: error
          });
          this.toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  openRatingHistoryPopup(contact: IContactCard) {
    if (!contact || !contact.rating || contact.rating.length === 0 || !this.isNeighbor) {
      return;
    }

    this.popup.open<void>({
      component: RatingHistoryPopupComponent,
      data: {
        rating: contact.rating
      }
    });
  }

  checkFilters(activated: boolean) {
    if (activated) {
      this.activatedFilters++;
    } else if (this.activatedFilters > 0) {
      this.activatedFilters--;
    }
  }

  onRemoveFilters() {
    this.search = '';
    this.filterTags.forEach(_tag => {
      _tag.selected = true;
    });
    this.activatedFilters = 0;
    this.refresh();
  }

  refresh() {
    this.contacts = [...this.contacts];
  }

  async copyPhone(phone: string) {
    try {
      await this.bizyCopyToClipboard.copy(phone);
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
      this.log.error({
        fileName: 'contacts.component',
        functionName: 'onCall',
        param: error
      });
      this.toast.danger();
    }
  }

  onWhatsapp(contact: IContactCard) {
    if (!contact.phones[0]) {
      return;
    }

    window.open(`${WHATSAPP_URL}${contact.phones[0].number}`, '_blank');
  }

  async onShare(contact: IContactCard) {
    try {
      if (!contact.phones[0]) {
        return;
      }

      await this.mobile.share({
        dialogTitle: this.translate.get('CONTACTS.SHARE_CONTACTS'),
        title: `${contact.name} ${contact.surname}`,
        text: `${this.translate.get('CORE.FORM.FIELD.NAME')}: ${contact.name}${contact.surname ? ' ' + contact.surname : ''}
${this.translate.get('CORE.FORM.FIELD.PHONE')}: ${contact.phones[0].number}
${this.translate.get('CORE.FORM.FIELD.TAG')}: ${contact.tags.join(', ')}`
      });
    } catch (error) {
      this.log.error({
        fileName: 'contacts.component',
        functionName: 'onShare',
        param: error
      });
      this.toast.danger({
        title: 'Error',
        msg: this.translate.get('CORE.FORM.ERROR.SHARE')
      });
    }
  }

  async export() {
    try {
      if (this.csvLoading || this.loading || !this.contacts || this.contacts.length === 0) {
        return;
      }

      this.csvLoading = true;

      const items = this.#filter(this.contacts);

      const fileName = this.translate.get('CONTACTS.CSV_FILE_NAME');
      const model = {
        name: this.translate.get('CORE.FORM.FIELD.NAME'),
        surname: this.translate.get('CORE.FORM.FIELD.SURNAME'),
        _phones: this.translate.get('CORE.FORM.FIELD.PHONE'),
        tags: this.translate.get('CORE.FORM.FIELD.TAG')
      };

      if (this.isMobile) {
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
    let _items = this.bizySearchPipe.transform(items, this.search, this.searchKeys);
    _items = this.bizyFilterPipe.transform(_items, 'tags', this.filterTags);
    _items = this.bizyOrderByPipe.transform(_items, this.order, this.orderBy);
    return _items;
  }
}
