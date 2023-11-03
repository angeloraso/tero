import { Component, Inject } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { HomeService } from '@app/home/home.service';
import { IContact } from '@core/model';
import { RouterService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { PATH as MENU_PATH } from '@menu/side-menu.routing';
import { PATH as CONTACTS_PATH } from './contacts.routing';

@Component({
  selector: 'tero-contacts',
  templateUrl: './contacts.html',
  styleUrls: ['./contacts.css']
})
export class ContactsComponent {
  showLoading = false;
  contacts: Array<IContact> = [];
  search: string = '';

  constructor(
    @Inject(RouterService) private router: RouterService,
    @Inject(HomeService) private home: HomeService
  ) {
    this.home.updateTitle('CONTACTS.TITLE');
  }

  onSearch(event: Event): void {
    this.search = (event.target as HTMLInputElement).value;
  }

  addContact() {
    this.router.goTo({
      path: `/${APP_PATH.MENU}/${MENU_PATH.HOME}/${HOME_PATH.CONTACTS}/${CONTACTS_PATH.ADD}`
    });
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
