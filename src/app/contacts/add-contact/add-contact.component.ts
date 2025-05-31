import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import { BIZY_TAG_TYPE, BizyFormComponent, BizyLogService, BizyPopupService, BizyRouterService, BizyToastService } from '@bizy/core';
import { ContactPicturePopupComponent, ContactTagsPopupComponent, RatingHistoryPopupComponent, RatingPopupComponent } from '@contacts/components';
import { DEFAULT_USER_PICTURE, IMG_PATH, LONG_TEXT_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@core/constants';
import { IContactRating, Rating } from '@core/model';
import { ContactsService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';

@Component({
  selector: 'tero-add-contact',
  templateUrl: './add-contact.html',
  styleUrls: ['./add-contact.css'],
  imports: SharedModules
})
export class AddContactComponent implements OnInit {
  @ViewChild(BizyFormComponent) formComponent: BizyFormComponent | null = null;
  readonly #contactsService = inject(ContactsService);
  readonly #auth = inject(AuthService);
  readonly #router = inject(BizyRouterService);
  readonly #toast = inject(BizyToastService);
  readonly #log = inject(BizyLogService);
  readonly #home = inject(HomeService);
  readonly #fb = inject(FormBuilder);
  readonly #popup = inject(BizyPopupService);

  loading: boolean = false;
  tagSearch: string | number = '';

  readonly #form = this.#fb.group({
    picture: [null],
    name: [null, [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH), Validators.required]],
    surname: [null, [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH)]],
    phone: [null, [Validators.required]],
    description: [null, [Validators.maxLength(LONG_TEXT_MAX_LENGTH)]],
    tags: [null, [Validators.required]],
    rating: [null]
  });

  readonly IMG_PATH = IMG_PATH;
  readonly DEFAULT_USER_PICTURE = DEFAULT_USER_PICTURE;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly LONG_TEXT_MAX_LENGTH = LONG_TEXT_MAX_LENGTH;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
    } catch (error) {
      this.#log.error({
        fileName: 'add-contact.component',
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

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.CONTACTS}` });
  }

  async openRatingPopup() {
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
        }
      }
    );
  }

  openPicturePopup() {
    if (this.loading) {
      return;
    }

    this.#popup.open<{ picture: string }>(
      {
        component: ContactPicturePopupComponent,
        fullScreen: true,
        data: { picture: this.picture.value }
      },
      async res => {
        try {
          if (res) {
            this.picture.setValue(res.picture);
          }
        } catch (error) {
          this.#log.error({
            fileName: 'add-contact.component',
            functionName: 'openPicturePopup',
            param: error
          });
          this.#toast.danger();
        }
      }
    );
  }

  openTagsPopup() {
    if (this.loading) {
      return;
    }

    this.#popup.open<{ tags: Array<string> }>(
      {
        component: ContactTagsPopupComponent,
        fullScreen: true,
        data: { tags: this.tags.value }
      },
      async res => {
        try {
          if (res) {
            this.tags.setValue(res.tags);
          }
        } catch (error) {
          this.#log.error({
            fileName: 'add-contact.component',
            functionName: 'openTagsPopup',
            param: error
          });
          this.#toast.danger();
        }
      }
    );
  }

  openRatingHistoryPopup() {
    if (!this.rating.value || this.rating.value.length === 0) {
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
      if (this.#form.invalid || this.loading) {
        this.formComponent?.setTouched();
        return;
      }

      this.loading = true;
      const accountEmail = this.#auth.getEmail();
      if (!accountEmail) {
        throw new Error();
      }

      await this.#contactsService.postContact({
        accountEmail: accountEmail,
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
        fileName: 'add-contact.component',
        functionName: 'save',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
