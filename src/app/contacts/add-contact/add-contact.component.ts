import { Component, Inject, OnDestroy } from '@angular/core';
import { IContact } from '@core/model';
import { ContactsService, RouterService } from '@core/services';
import { HomeService } from '@home/home.service';

@Component({
  selector: 'tero-add-contact',
  templateUrl: './add-contact.html',
  styleUrls: ['./add-contact.css']
})
export class AddContactComponent implements OnDestroy {
  showLoading = false;

  constructor(
    @Inject(ContactsService) private contacts: ContactsService,
    @Inject(RouterService) private router: RouterService,
    @Inject(HomeService) private home: HomeService
  ) {
    this.home.updateTitle('CONTACTS.ADD_CONTACT.TITLE');
    this.home.hideBottomBar(true);
  }

  goBack() {
    this.router.goBack();
  }

  async save(contact: IContact) {
    try {
      if (!contact) {
        return;
      }

      this.showLoading = true;
      await this.contacts.postContact(contact);
      this.goBack();
    } catch (error) {
      console.error(error);
    } finally {
      this.showLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.home.hideBottomBar(false);
  }
}
