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
import { BizyTranslateService, BizyValidatorService } from '@bizy/services';
import {
  CONTACT_TAGS,
  DEFAULT_PICTURE,
  LONG_TEXT_MAX_LENGTH,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH
} from '@core/constants';
import { Empty, IContact } from '@core/model';

@Component({
  selector: 'tero-contact-form',
  templateUrl: './contact-form.html',
  styleUrls: ['./contact-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ContactFormComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<IContact>();
  form: FormGroup;

  availableTags: Array<{ id: string; value: string }> = [];
  selectedTags = new Set<string>();

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly LONG_TEXT_MAX_LENGTH = LONG_TEXT_MAX_LENGTH;

  @Input() set id(id: string | Empty) {
    if (!id) {
      return;
    }

    this._id.setValue(id);
  }

  @Input() set created(created: number | Empty) {
    if (!created) {
      return;
    }

    this._created.setValue(created);
  }

  @Input() set updated(updated: number | Empty) {
    if (!updated) {
      return;
    }

    this._updated.setValue(updated);
  }

  @Input() set picture(picture: string | Empty) {
    if (!picture) {
      this._picture.setValue(DEFAULT_PICTURE);
      return;
    }

    this._picture.setValue(picture);
  }

  @Input() set surname(surname: string | Empty) {
    if (!surname) {
      return;
    }

    this._surname.setValue(surname);
  }

  @Input() set name(name: string | Empty) {
    if (!name) {
      return;
    }

    this._name.setValue(name);
  }

  @Input() set phone(phone: string | Empty) {
    if (!phone) {
      return;
    }

    this._phone.setValue(phone);
  }

  @Input() set description(description: string | Empty) {
    if (!description) {
      return;
    }

    this._description.setValue(description);
  }

  @Input() set tags(tags: Array<string> | Empty) {
    if (!tags) {
      return;
    }

    this.selectedTags = new Set(tags);
    tags.forEach(_tag => {
      const index = this.availableTags.findIndex(_t => _t.id === _tag);
      if (index !== -1) {
        this.availableTags.splice(index, 1);
      }
    });
  }

  constructor(
    @Inject(FormBuilder) private fb: FormBuilder,
    @Inject(ChangeDetectorRef) private ref: ChangeDetectorRef,
    @Inject(BizyValidatorService) private validator: BizyValidatorService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService
  ) {
    CONTACT_TAGS.forEach(_tag => {
      this.availableTags.push({ id: _tag, value: this.translate.get(`CONTACTS.TAG.${_tag}`) });
    });
    this.form = this.fb.group({
      id: [null],
      created: [null],
      updated: [null],
      picture: [DEFAULT_PICTURE, [Validators.required]],
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
      phone: [null, [this.validator.phoneNumberValidator(), Validators.required]],
      description: [null, [Validators.maxLength(LONG_TEXT_MAX_LENGTH)]]
    });
  }

  get _id() {
    return this.form.get('id') as FormControl;
  }

  get _created() {
    return this.form.get('created') as FormControl;
  }

  get _updated() {
    return this.form.get('updated') as FormControl;
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

  addTag(tag: string) {
    if (!tag) {
      return;
    }

    this.selectedTags.add(tag);
    const index = this.availableTags.findIndex(_t => _t.id === tag);
    if (index !== -1) {
      this.availableTags.splice(index, 1);
    }
  }

  removeTag(tag: string) {
    this.selectedTags.delete(tag);
    this.availableTags.push({ id: tag, value: this.translate.get(`CONTACTS.TAG.${tag}`) });
  }

  _confirm() {
    if (this.form.invalid) {
      this.ref.detectChanges();
      return;
    }

    this.save.emit({
      id: this._id.value,
      created: this._created.value,
      updated: this._updated.value,
      picture: this._picture.value,
      description: this._description.value ? this._description.value.trim() : '',
      surname: this._surname.value ? this._surname.value.trim() : '',
      name: this._name.value ? this._name.value.trim() : '',
      comments: [],
      tags: Array.from(this.selectedTags),
      score: [],
      phones: [{ number: this._phone.value, description: '' }]
    });
  }

  _cancel() {
    this.cancel.emit();
  }
}
