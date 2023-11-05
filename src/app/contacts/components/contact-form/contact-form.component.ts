import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DEFAULT_PICTURE, TAGS } from '@core/constants';
import { Empty, IContact, IPhone } from '@core/model';

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
  readonly TAGS = TAGS;

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

  @Input() set comments(comments: string | Empty) {
    if (!comments) {
      return;
    }

    this._comments.setValue(comments);
  }

  @Input() set phones(phones: Array<IPhone> | Empty) {
    if (!phones || phones.length === 0) {
      return;
    }

    this._phone.setValue(phones[0].number);
  }

  @Input() set tags(tags: Array<string> | Empty) {
    if (!tags) {
      return;
    }

    this._tags.setValue(tags);
    this.TAGS.forEach(_tag => {
      if (tags.includes(_tag.id)) {
        _tag.selected = true;
      }
    });
  }

  constructor(@Inject(FormBuilder) private fb: FormBuilder) {
    this.form = this.fb.group({
      id: [null],
      picture: [DEFAULT_PICTURE, [Validators.required]],
      name: [null, [Validators.required]],
      surname: [null],
      comments: [null],
      tags: [[]],
      phone: [null, [Validators.required]],
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

  get _comments() {
    return this.form.get('comments') as AbstractControl;
  }

  get _score() {
    return this.form.get('score') as AbstractControl;
  }

  get _phone() {
    return this.form.get('phone') as AbstractControl;
  }

  get _tags() {
    return this.form.get('tags') as AbstractControl;
  }

  selectTag(tags: Array<string>) {
    this._tags.setValue(tags);
  }

  _confirm() {
    if (this.form.invalid) {
      return;
    }

    this.confirm.emit({
      id: this._id.value,
      picture: this._picture.value,
      surname: this._surname.value ? this._surname.value.trim() : '',
      name: this._name.value.trim(),
      comments: this._comments.value ? this._comments.value.trim() : '',
      score: this._score.value,
      phones: [{ number: this._phone.value.trim(), description: '' }],
      tags: this._tags.value
    });
  }

  _cancel() {
    this.cancel.emit();
  }
}
