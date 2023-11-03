import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DEFAULT_PICTURE } from '@core/constants';
import { Empty, IContact } from '@core/model';

@Component({
  selector: 'tero-contact-form',
  templateUrl: './contact-form.html',
  styleUrls: ['./contact-form.css']
})
export class ContactFormComponent {
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<IContact>();
  form: FormGroup;

  readonly MIN_VALUE = 0;
  readonly MAX_VALUE = 5;

  @Input() set id(id: string | Empty) {
    if (!id) {
      return;
    }

    this._id.setValue(id);
  }

  @Input() set picture(picture: string | Empty) {
    if (!picture) {
      this._picture.setValue(DEFAULT_PICTURE);
      return;
    }

    this._picture.setValue(picture);
  }

  @Input() set name(name: string | Empty) {
    if (!name) {
      return;
    }

    this._name.setValue(name);
  }

  @Input() set surname(surname: string | Empty) {
    if (!surname) {
      return;
    }

    this._surname.setValue(surname);
  }

  @Input() set score(score: number | Empty) {
    if (!score) {
      return;
    }

    this._score.setValue(score);
  }

  @Input() set description(description: string | Empty) {
    if (!description) {
      return;
    }

    this._description.setValue(description);
  }

  constructor(@Inject(FormBuilder) private fb: FormBuilder) {
    this.form = this.fb.group({
      id: [null],
      picture: [DEFAULT_PICTURE, [Validators.required]],
      surname: [null, [Validators.required]],
      name: [null, [Validators.required]],
      description: [null],
      score: [
        0,
        [Validators.min(this.MIN_VALUE), Validators.max(this.MAX_VALUE), Validators.required]
      ]
    });
  }

  get _id() {
    return this.form.get('id') as AbstractControl;
  }

  get _picture() {
    return this.form.get('picture') as AbstractControl;
  }

  get _name() {
    return this.form.get('name') as AbstractControl;
  }

  get _surname() {
    return this.form.get('surname') as AbstractControl;
  }

  get _description() {
    return this.form.get('description') as AbstractControl;
  }

  get _score() {
    return this.form.get('score') as AbstractControl;
  }

  _confirm() {
    if (this.form.invalid) {
      return;
    }

    this.confirm.emit({
      id: this._id.value,
      picture: this._picture.value,
      surname: this._surname.value.trim(),
      name: this._name.value.trim(),
      description: this._description.value,
      score: this._score.value,
      phones: []
    });
  }

  _cancel() {
    this.cancel.emit();
  }
}
