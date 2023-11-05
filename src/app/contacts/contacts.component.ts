import { Component, Inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { HomeService } from '@app/home/home.service';
import { TAGS, WHATSAPP_URL } from '@core/constants';
import { IContact, ITag } from '@core/model';
import {
  ContactsService,
  MobileService,
  RouterService,
  TeroTranslateService
} from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { PATH as MENU_PATH } from '@menu/side-menu.routing';
import { PATH as CONTACTS_PATH } from './contacts.routing';

interface IContactCard extends IContact {
  _tags: Array<ITag & { _value: string }>;
}
@Component({
  selector: 'tero-contacts',
  templateUrl: './contacts.html',
  styleUrls: ['./contacts.css']
})
export class ContactsComponent implements OnInit {
  showLoading = false;
  contacts: Array<IContactCard> = [];
  search: string = '';

  constructor(
    @Inject(RouterService) private router: RouterService,
    @Inject(HomeService) private home: HomeService,
    @Inject(MobileService) private mobile: MobileService,
    @Inject(TeroTranslateService) private translate: TeroTranslateService,
    @Inject(ContactsService) private contactsService: ContactsService
  ) {
    this.home.updateTitle('CONTACTS.TITLE');
  }

  async ngOnInit() {
    try {
      this.showLoading = true;
      const contacts = await this.contactsService.getContacts();
      this.contacts = contacts.map(_contact => {
        const tags: Array<ITag & { _value: string }> = [];
        _contact.tags.forEach(_tagId => {
          const tag = TAGS.find(_tag => _tag.id === _tagId);
          if (tag) {
            (<ITag & { _value: string }>tag)._value = this.translate.get(tag.value);
            tags.push(tag as ITag & { _value: string });
          }
        });

        return { ..._contact, _tags: tags };
      });
    } catch (error) {
      console.log(error);
    } finally {
      this.showLoading = false;
    }
  }

  onSearch(event: Event): void {
    this.search = (event.target as HTMLInputElement).value;
  }

  addContact() {
    this.router.goTo({
      path: `/${APP_PATH.MENU}/${MENU_PATH.HOME}/${HOME_PATH.CONTACTS}/${CONTACTS_PATH.ADD}`
    });
  }

  onWhatsapp(contact: IContactCard) {
    window.open(`${WHATSAPP_URL}${contact.phones[0].number}`, '_blank');
  }

  async onCall(contact: IContactCard) {
    try {
      await this.mobile.call(contact.phones[0].number);
    } catch (error) {
      console.log(error);
    }
  }

  editContact(contact: IContact) {
    if (!contact) {
      return;
    }

    this.router.goTo({
      path: `/${APP_PATH.MENU}/${MENU_PATH.HOME}/${HOME_PATH.CONTACTS}/${contact.id}`
    });
  }
}
