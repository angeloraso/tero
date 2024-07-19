import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {
  AVAILABLE_LOTS,
  AVAILABLE_SECURITY_GROUPS,
  DEFAULT_PICTURE,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH
} from '@core/constants';
import { Empty, INeighbor } from '@core/model';
import { MobileService } from '@core/services';

@Component({
  selector: 'tero-neighbor-form',
  templateUrl: './neighbor-form.html',
  styleUrls: ['./neighbor-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NeighborFormComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<INeighbor>();
  form: FormGroup;
  isMobile = true;

  readonly MIN_VALUE = 0;
  readonly MAX_VALUE = AVAILABLE_LOTS;
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly GROUPS = AVAILABLE_SECURITY_GROUPS;

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

  @Input() set group(group: number | Empty) {
    if (!group) {
      return;
    }

    this._group.setValue(group);
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

  @Input() set lot(lot: number | Empty) {
    if (!lot) {
      return;
    }

    this._lot.setValue(lot);
  }

  @Input() set security(security: boolean | Empty) {
    if (typeof security === 'undefined' || security === null) {
      return;
    }

    this.setSecurity(security);
  }

  constructor(
    @Inject(FormBuilder) private fb: FormBuilder,
    @Inject(MobileService) private mobile: MobileService
  ) {
    this.isMobile = this.mobile.isMobile();
    this.form = this.fb.group({
      id: [null],
      created: [null],
      updated: [null],
      picture: [DEFAULT_PICTURE, [Validators.required]],
      group: [null, [Validators.required]],
      surname: [null, [Validators.required]],
      name: [null, [Validators.required]],
      security: [true, [Validators.required]],
      lot: [
        null,
        [Validators.min(this.MIN_VALUE), Validators.max(this.MAX_VALUE), Validators.required]
      ]
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

  get _group() {
    return this.form.get('group') as FormControl;
  }

  get _surname() {
    return this.form.get('surname') as FormControl;
  }

  get _name() {
    return this.form.get('name') as FormControl;
  }

  get _security() {
    return this.form.get('security') as FormControl;
  }

  get _lot() {
    return this.form.get('lot') as FormControl;
  }

  setSecurity(enable: boolean) {
    this._security.setValue(enable);

    if (enable) {
      this._group.setValidators([Validators.required]);
    } else {
      this._group.clearValidators();
    }

    this._group.updateValueAndValidity();
  }

  _confirm() {
    if (this.form.invalid) {
      return;
    }

    this.save.emit({
      id: this._id.value,
      created: this._created.value,
      updated: this._updated.value,
      picture: this._picture.value,
      group: this._group.value,
      surname: this._surname.value.trim(),
      name: this._name.value.trim(),
      security: this._security.value,
      lot: this._lot.value,
      phones: []
    });
  }

  _cancel() {
    this.cancel.emit();
  }
}
