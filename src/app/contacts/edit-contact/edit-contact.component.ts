import { ChangeDetectorRef, Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import {
  BIZY_TAG_TYPE,
  BizyFormComponent,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { ContactTagsPopupComponent, RatingHistoryPopupComponent, RatingPopupComponent } from '@contacts/components';
import { DEFAULT_USER_PICTURE, LONG_TEXT_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@core/constants';
import { IContact, IContactRating, Rating } from '@core/model';
import { ContactsService, UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';

@Component({
  selector: 'tero-edit-contact',
  templateUrl: './edit-contact.html',
  styleUrls: ['./edit-contact.css'],
  imports: SharedModules
})
export class EditContactComponent implements OnInit {
  @ViewChild(BizyFormComponent) formComponent: BizyFormComponent | null = null;
  readonly #contactsService = inject(ContactsService);
  readonly #auth = inject(AuthService);
  readonly #router = inject(BizyRouterService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #toast = inject(BizyToastService);
  readonly #log = inject(BizyLogService);
  readonly #home = inject(HomeService);
  readonly #fb = inject(FormBuilder);
  readonly #ref = inject(ChangeDetectorRef);
  readonly #popup = inject(BizyPopupService);
  readonly #translate = inject(BizyTranslateService);
  readonly #usersService = inject(UsersService);

  loading: boolean = false;
  contact: IContact | null = null;
  contactId: string | null = null;

  readonly #form = this.#fb.group({
    picture: [DEFAULT_USER_PICTURE, [Validators.required]],
    name: [null, [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH), Validators.required]],
    surname: [null, [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH)]],
    phone: [null, [Validators.required]],
    description: [null, [Validators.maxLength(LONG_TEXT_MAX_LENGTH)]],
    tags: [null, [Validators.required]],
    rating: [null]
  });

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly LONG_TEXT_MAX_LENGTH = LONG_TEXT_MAX_LENGTH;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();

      this.contactId = this.#router.getId(this.#activatedRoute, 'contactId');
      if (!this.contactId) {
        this.goBack();
        return;
      }

      const [contact, isConfig] = await Promise.all([this.#contactsService.getContact(this.contactId), this.#usersService.isConfig()]);

      if (
        !contact ||
        (contact.accountId && contact.accountId !== this.#auth.getId() && !isConfig) ||
        (contact.accountEmail && contact.accountEmail !== this.#auth.getEmail() && !isConfig)
      ) {
        this.goBack();
        return;
      }

      this.contact = structuredClone(contact);

      if (this.contact.picture) {
        this.picture.setValue(this.contact.picture);
      }

      if (this.contact.name) {
        this.name.setValue(this.contact.name);
      }

      if (this.contact.surname) {
        this.surname.setValue(this.contact.surname);
      }

      if (this.contact.phones) {
        this.phone.setValue(this.contact.phones[0].number);
      }

      if (this.contact.description) {
        this.description.setValue(this.contact.description);
      }

      if (this.contact.tags) {
        this.tags.setValue(this.contact.tags);
      }

      if (this.contact.rating) {
        this.rating.setValue(this.contact.rating);
      }
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

  get picture() {
    return this.#form.get('picture') as FormControl;
  }

  get name() {
    return this.#form.get('name') as FormControl;
  }

  get surname() {
    return this.#form.get('surname') as FormControl;
  }

  get description() {
    return this.#form.get('description') as FormControl;
  }

  get phone() {
    return this.#form.get('phone') as FormControl;
  }

  get tags() {
    return this.#form.get('tags') as FormControl<Array<string> | null>;
  }

  get rating() {
    return this.#form.get('rating') as FormControl<Array<IContactRating> | null>;
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
          if (res && this.contact) {
            this.loading = true;
            await this.#contactsService.deleteContact(this.contact);
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

  async openRatingPopup() {
    if (this.loading) {
      return;
    }

    const [accountEmail, accountId] = await Promise.all([this.#auth.getEmail(), this.#auth.getId()]);
    if (!accountId || !accountEmail) {
      return;
    }

    let value = null;
    let description = null;

    if (this.rating.value && this.rating.value.length > 0) {
      const contactRating = this.rating.value.find(_rating => _rating.accountId === accountId || _rating.accountEmail === accountEmail);
      if (contactRating) {
        value = contactRating.value;
        description = contactRating.description;
      }
    }

    this.#popup.open<{ value: Rating; description: string } | 'delete'>(
      {
        component: RatingPopupComponent,
        data: {
          value,
          description
        }
      },
      data => {
        if (data) {
          if (data === 'delete') {
            if (this.rating.value) {
              const index = this.rating.value.findIndex(_rating => _rating.accountId === accountId || _rating.accountEmail === accountEmail);
              if (index !== -1) {
                const rating = this.rating.value;
                rating.splice(index, 1);
                this.rating.setValue([...rating]);
              }
            }
          } else {
            const contactRating: IContactRating = { ...data, accountId, accountEmail };
            if (this.rating.value && this.rating.value.length > 0) {
              const index = this.rating.value.findIndex(
                _rating => _rating.accountId === contactRating.accountId || _rating.accountEmail === contactRating.accountEmail
              );
              if (index !== -1) {
                const rating = this.rating.value;
                rating[index] = contactRating;
                this.rating.setValue([...rating]);
              } else {
                const rating = this.rating.value;
                rating.push(contactRating);
                this.rating.setValue([...rating]);
              }
            } else {
              this.rating.setValue([contactRating]);
            }
          }

          this.#ref.detectChanges();
        }
      }
    );
  }

  openTagsPopup() {
    if (this.loading) {
      return;
    }

    this.#popup.open<Array<string>>(
      {
        component: ContactTagsPopupComponent,
        fullScreen: true,
        data: { tags: this.tags.value }
      },
      async tags => {
        try {
          if (tags) {
            if (tags.length > 0) {
              this.tags.setValue(tags);
            } else {
              this.tags.setValue(null);
            }
          }
        } catch (error) {
          this.#log.error({
            fileName: 'edit-contact.component',
            functionName: 'openTagsPopup',
            param: error
          });
          this.#toast.danger();
        }
      }
    );
  }

  openRatingHistoryPopup() {
    if (this.loading || !this.rating.value || this.rating.value.length === 0) {
      return;
    }

    this.#popup.open<void>({
      component: RatingHistoryPopupComponent,
      data: {
        rating: this.rating.value
      }
    });
  }

  async save() {
    try {
      if (this.#form.invalid || this.loading || !this.contact) {
        this.formComponent?.setTouched();
        return;
      }

      this.loading = true;

      await this.#contactsService.putContact({
        ...this.contact,
        picture: this.picture.value ?? '',
        description: this.description.value ? this.description.value.trim() : '',
        surname: this.surname.value ? this.surname.value.trim() : '',
        name: this.name.value ? this.name.value.trim() : '',
        rating: this.rating.value ?? [],
        tags: this.tags.value ?? [],
        phones: [{ number: this.phone.value ?? '', description: '' }]
      });
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
