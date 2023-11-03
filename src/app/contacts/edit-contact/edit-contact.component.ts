import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConfirmAlertComponent } from '@components/confirm-alert';
import { Empty, IContact } from '@core/model';
import { ContactsService, RouterService } from '@core/services';
import { HomeService } from '@home/home.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tero-edit-contact',
  templateUrl: './edit-contact.html',
  styleUrls: ['./edit-contact.css']
})
export class EditContactComponent implements OnInit, OnDestroy {
  contact: IContact | Empty;
  contactId: string | Empty;
  showLoading = false;

  #subscription = new Subscription();

  constructor(
    @Inject(MatDialog) private dialog: MatDialog,
    @Inject(ContactsService) private contacts: ContactsService,
    @Inject(RouterService) private router: RouterService,
    @Inject(ActivatedRoute) private activatedRoute: ActivatedRoute,
    @Inject(HomeService) private home: HomeService
  ) {
    this.home.updateTitle('CONTACTS.EDIT_CONTACT.TITLE');
    this.home.hideBottomBar(true);
  }

  async ngOnInit() {
    try {
      this.showLoading = true;
      this.contactId = this.router.getId(this.activatedRoute, 'contactId');
      if (!this.contactId) {
        this.goBack();
        return;
      }

      this.contact = await this.contacts.getContact(this.contactId);
    } catch (error) {
      console.error(error);
    } finally {
      this.showLoading = false;
      this.home.setDeleteFn(this.openAlertDialog);
    }
  }

  openAlertDialog = () => {
    if (!this.contact) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmAlertComponent, {
      data: this.contact,
      scrollStrategy: new NoopScrollStrategy(),
      panelClass: 'tero-material-dialog'
    });

    this.#subscription.add(
      dialogRef.afterClosed().subscribe((res: boolean) => {
        if (res) {
          this._deleteContact(this.contact!);
        }
      })
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

      this.showLoading = true;
      this.home.setDeleteFn(null);
      await this.contacts.putContact(contact);
      this.goBack();
    } catch (error) {
      this.home.setDeleteFn(this.openAlertDialog);
      console.error(error);
    } finally {
      this.showLoading = false;
    }
  }

  private async _deleteContact(contact: IContact) {
    try {
      this.showLoading = true;
      this.home.setDeleteFn(null);
      await this.contacts.deleteContact(contact);
      this.goBack();
    } catch (error) {
      this.home.setDeleteFn(this.openAlertDialog);
      console.log(error);
    } finally {
      this.showLoading = false;
    }
  }

  ngOnDestroy() {
    this.#subscription.unsubscribe();
    this.home.setDeleteFn(null);
    this.home.hideBottomBar(false);
  }
}
