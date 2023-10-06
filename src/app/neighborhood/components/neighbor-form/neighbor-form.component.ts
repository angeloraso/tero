import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DEFAULT_PICTURE } from '@core/constants';
import { INeighbor } from '@core/model';

@Component({
  selector: 'tero-neighbor-form',
  templateUrl: './neighbor-form.html',
  styleUrls: ['./neighbor-form.css']
})
export class NeighborFormComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<INeighbor>();
  form: FormGroup;

  readonly MIN_VALUE = 0;

  @Input() set id(id: string) {
    if (!id) {
      return;
    }

    this._id.setValue(id);
  }

  @Input() set picture(picture: string) {
    if (!picture) {
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

  @Input() set lot(lot: string) {
    if (!lot) {
      return;
    }

    this._lot.setValue(lot);
  }

  constructor(@Inject(FormBuilder) private fb: FormBuilder) {
    this.form = this.fb.group({
      id: [null],
      picture: [DEFAULT_PICTURE, [Validators.required]],
      surname: [null, [Validators.required]],
      name: [null, [Validators.required]],
      lot: [null, [Validators.min(this.MIN_VALUE), Validators.required]]
    });
  }

  get _id() {
    return this.form.get('id') as AbstractControl;
  }

  get _picture() {
    return this.form.get('picture') as AbstractControl;
  }

  get _surname() {
    return this.form.get('surname') as AbstractControl;
  }

  get _name() {
    return this.form.get('name') as AbstractControl;
  }

  get _lot() {
    return this.form.get('lot') as AbstractControl;
  }

  _confirm() {
    if (this.form.invalid) {
      return;
    }

    this.confirm.emit({
      id: this._id.value,
      picture: this._picture.value,
      surname: this._surname.value,
      name: this._name.value,
      lot: this._lot.value,
      phones: []
    });
  }

  _cancel() {
    this.cancel.emit();
  }
}
