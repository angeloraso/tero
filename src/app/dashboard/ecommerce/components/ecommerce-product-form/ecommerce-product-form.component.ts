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
import { LONG_TEXT_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@core/constants';
import { IPhone } from '@core/model';
import { MobileService } from '@core/services';

@Component({
  selector: 'tero-ecommerce-product-form',
  templateUrl: './ecommerce-product-form.html',
  styleUrls: ['./ecommerce-product-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EcommerceProductFormComponent {
  @Input() id: string = '';
  @Input() accountId: string = '';
  @Input() created: number = 0;
  @Input() updated: number = 0;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    name: string;
    description: string;
    pictures: Array<string>;
    phones: Array<IPhone>;
    tags: Array<string>;
  }>();
  form: FormGroup;
  tagSearch: string | number = '';
  availableTags: Array<string> = [];
  selectedTags: Array<string> = [];
  isMobile = true;

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly DESCRIPTION_LENGTH = 1024;

  @Input() set tags(tags: { available: Array<string>; selected: Array<string> }) {
    if (!tags) {
      return;
    }

    this.availableTags = [...tags.available];
    this.selectedTags = [...tags.selected];
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
    @Inject(MobileService) private mobile: MobileService
  ) {
    this.isMobile = this.mobile.isMobile();
    this.form = this.fb.group({
      name: [
        null,
        [
          Validators.minLength(NAME_MIN_LENGTH),
          Validators.maxLength(NAME_MAX_LENGTH),
          Validators.required
        ]
      ],
      phone: [null, [Validators.required]],
      description: [null, [Validators.maxLength(LONG_TEXT_MAX_LENGTH)]]
    });
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
      name: this._name.value ? this._name.value.trim() : '',
      description: this._description.value ? this._description.value.trim() : '',
      pictures: [],
      phones: [{ number: this._phone.value, description: '' }],
      tags: Array.from(this.selectedTags)
    });
  }

  _cancel() {
    this.cancel.emit();
  }
}
