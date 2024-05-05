import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Inject,
  Input,
  Output
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CONTACT_TAGS, DEFAULT_PICTURE } from '@core/constants';
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

  readonly TAGS = CONTACT_TAGS;

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

  @Input() set description(description: string | Empty) {
    if (!description) {
      return;
    }

    this._description.setValue(description);
  }

  constructor(@Inject(FormBuilder) private fb: FormBuilder) {
    this.form = this.fb.group({
      id: [null],
      created: [null],
      updated: [null],
      picture: [DEFAULT_PICTURE, [Validators.required]],
      surname: [null],
      name: [null, [Validators.required]],
      description: [null]
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

  _confirm() {
    if (this.form.invalid) {
      return;
    }

    this.save.emit({
      id: this._id.value,
      created: this._created.value,
      updated: this._updated.value,
      picture: this._picture.value,
      description: this._description.value,
      surname: this._surname.value.trim(),
      name: this._name.value.trim(),
      comments: [],
      tags: [],
      score: [],
      phones: []
    });
  }

  _cancel() {
    this.cancel.emit();
  }
}
