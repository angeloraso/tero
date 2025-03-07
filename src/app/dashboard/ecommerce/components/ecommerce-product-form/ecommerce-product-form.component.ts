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
import { SharedModules } from '@app/shared';
import { BIZY_TAG_TYPE } from '@bizy/core';
import { LONG_TEXT_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@core/constants';
import { IPhone } from '@core/model';
import { MobileService } from '@core/services';

@Component({
    selector: 'tero-ecommerce-product-form',
    templateUrl: './ecommerce-product-form.html',
    styleUrls: ['./ecommerce-product-form.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: SharedModules
})
export class EcommerceProductFormComponent {
  @Input() disabled: boolean = false;
  @Input() created: number = 0;
  @Input() updated: number = 0;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    productName: string;
    contactName: string;
    price: number | null;
    description: string;
    pictures: Array<string>;
    phones: Array<IPhone>;
    tags: Array<string>;
  }>();
  form: FormGroup;
  tagSearch: string | number = '';
  availableTags: Array<string> = [];
  selectedTags: Array<string> = [];
  isMobile: boolean = true;
  checkPrice: boolean = false;

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

  @Input() set productName(productName: string) {
    if (!productName) {
      return;
    }

    this._productName.setValue(productName);
  }

  @Input() set price(price: number | null) {
    if (typeof price === 'undefined') {
      return;
    }

    this._price.setValue(price);
    this.checkPrice = price === null;
    this.onCheckPrice();
  }

  @Input() set contactName(contactName: string) {
    if (!contactName) {
      return;
    }

    this._contactName.setValue(contactName);
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
      productName: [
        null,
        [
          Validators.minLength(NAME_MIN_LENGTH),
          Validators.maxLength(NAME_MAX_LENGTH),
          Validators.required
        ]
      ],
      price: [null, [Validators.required]],
      phone: [null, [Validators.required]],
      contactName: [
        null,
        [
          Validators.minLength(NAME_MIN_LENGTH),
          Validators.maxLength(NAME_MAX_LENGTH),
          Validators.required
        ]
      ],
      description: [null, [Validators.maxLength(LONG_TEXT_MAX_LENGTH)]]
    });
  }

  get _productName() {
    return this.form.get('productName') as FormControl;
  }

  get _contactName() {
    return this.form.get('contactName') as FormControl;
  }

  get _price() {
    return this.form.get('price') as FormControl;
  }

  get _description() {
    return this.form.get('description') as FormControl;
  }

  get _phone() {
    return this.form.get('phone') as FormControl;
  }

  onCheckPrice() {
    if (this.checkPrice) {
      this._price.disable();
      this._price.setValidators([]);
      this._price.updateValueAndValidity();
    } else {
      this._price.enable();
      this._price.setValidators([Validators.required]);
      this._price.updateValueAndValidity();
    }
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
      productName: this._productName.value ? this._productName.value.trim() : '',
      contactName: this._contactName.value ? this._contactName.value.trim() : '',
      description: this._description.value ? this._description.value.trim() : '',
      pictures: [],
      price:
        !this.checkPrice && (this._price.value || this._price.value === 0)
          ? Number(this._price.value)
          : null,
      phones: [{ number: this._phone.value, description: '' }],
      tags: Array.from(this.selectedTags)
    });
  }

  _cancel() {
    this.cancel.emit();
  }
}
