import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BIZY_TAG_TYPE } from '@bizy/components';
import { BizyPopupService } from '@bizy/services';
import { RatingHistoryPopupComponent, RatingPopupComponent } from '@contacts/components';
import { AuthService } from '@core/auth/auth.service';
import {
  DEFAULT_USER_PICTURE,
  LONG_TEXT_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH
} from '@core/constants';
import { IContact, IContactRating } from '@core/model';
import { MobileService } from '@core/services';

@Component({
  selector: 'tero-contact-form',
  templateUrl: './contact-form.html',
  styleUrls: ['./contact-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactFormComponent {
  @Input() id: string = '';
  @Input() accountId: string = '';
  @Input() created: number = 0;
  @Input() updated: number = 0;
  @Input() rating: Array<IContactRating> = [];
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<IContact>();
  form: FormGroup;
  tagSearch: string | number = '';
  availableTags: Array<string> = [];
  selectedTags: Array<string> = [];
  isMobile = true;

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly LONG_TEXT_MAX_LENGTH = LONG_TEXT_MAX_LENGTH;

  @Input() set tags(tags: { available: Array<string>; selected: Array<string> }) {
    if (!tags) {
      return;
    }

    this.availableTags = [...tags.available];
    this.selectedTags = [...tags.selected];
  }

  @Input() set picture(picture: string) {
    if (!picture) {
      this._picture.setValue(DEFAULT_USER_PICTURE);
      return;
    }

    this._picture.setValue(picture);
  }

  @Input() set surname(surname: string) {
    if (!surname) {
      return;
    }

    this._surname.setValue(surname);
  }

  @Input() set name(name: string) {
    if (!name) {
      return;
    }

    this._name.setValue(name);
  }

  @Input() set phone(phone: string) {
    if (!phone) {
      return;
    }

    this._phone.setValue(phone);
  }

  @Input() set description(description: string) {
    if (!description) {
      return;
    }

    this._description.setValue(description);
  }

  constructor(
    @Inject(FormBuilder) private fb: FormBuilder,
    @Inject(ChangeDetectorRef) private ref: ChangeDetectorRef,
    @Inject(MobileService) private mobile: MobileService,
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(AuthService) private auth: AuthService
  ) {
    this.isMobile = this.mobile.isMobile();
    this.form = this.fb.group({
      picture: [DEFAULT_USER_PICTURE, [Validators.required]],
      name: [
        null,
        [
          Validators.minLength(NAME_MIN_LENGTH),
          Validators.maxLength(NAME_MAX_LENGTH),
          Validators.required
        ]
      ],
      surname: [
        null,
        [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH)]
      ],
      phone: [null, [Validators.required]],
      description: [null, [Validators.maxLength(LONG_TEXT_MAX_LENGTH)]]
    });
  }

  get _picture() {
    return this.form.get('picture') as FormControl;
  }

  get _surname() {
    return this.form.get('surname') as FormControl;
  }

  get _name() {
    return this.form.get('name') as FormControl;
  }

  get _description() {
    return this.form.get('description') as FormControl;
  }

  get _phone() {
    return this.form.get('phone') as FormControl;
  }

  async openRatingPopup() {
    const accountId = await this.auth.getId();
    if (!accountId) {
      return;
    }

    let value = null;
    let description = null;

    if (this.rating && this.rating.length > 0) {
      const contactRating = this.rating.find(_rating => _rating.accountId === accountId);
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
      rating => {
        if (rating) {
          if (this.rating && this.rating.length > 0) {
            const index = this.rating.findIndex(_rating => _rating.accountId === rating.accountId);
            if (index !== -1) {
              this.rating[index] = rating;
            } else {
              this.rating.push(rating);
            }
          } else {
            this.rating = [rating];
          }

          this.rating = [...this.rating];
          this.ref.detectChanges();
        }
      }
    );
  }

  openRatingHistoryPopup() {
    if (!this.rating || this.rating.length === 0) {
      return;
    }

    this.popup.open<void>({
      component: RatingHistoryPopupComponent,
      data: {
        rating: this.rating
      }
    });
  }

  addTag(tag: string) {
    if (!tag) {
      return;
    }

    this.selectedTags.push(tag);

    const index = this.availableTags.findIndex(_tag => _tag === tag);
    if (index !== -1) {
      this.availableTags.splice(index, 1);
    }

    this.selectedTags = [...this.selectedTags];
    this.availableTags = [...this.availableTags];
  }

  removeTag(tag: string) {
    if (!tag) {
      return;
    }

    this.availableTags.push(tag);

    const index = this.selectedTags.findIndex(_tag => _tag === tag);
    if (index !== -1) {
      this.selectedTags.splice(index, 1);
    }

    this.selectedTags = [...this.selectedTags];
    this.availableTags = [...this.availableTags];
  }

  _confirm() {
    if (this.form.invalid) {
      this.ref.detectChanges();
      return;
    }

    this.save.emit({
      id: this.id,
      accountId: this.accountId,
      created: this.created,
      updated: this.updated,
      picture: this._picture.value,
      description: this._description.value ? this._description.value.trim() : '',
      surname: this._surname.value ? this._surname.value.trim() : '',
      name: this._name.value ? this._name.value.trim() : '',
      rating: this.rating,
      tags: Array.from(this.selectedTags),
      phones: [{ number: this._phone.value, description: '' }]
    });
  }

  _cancel() {
    this.cancel.emit();
  }
}
