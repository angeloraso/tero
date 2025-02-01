import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  Output
} from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BIZY_TAG_TYPE } from '@bizy/components';
import { LONG_TEXT_MAX_LENGTH, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@core/constants';
import { TOPIC_STATE } from '@core/model';
import { MobileService } from '@core/services';

@Component({
  selector: 'tero-topic-form',
  templateUrl: './topic-form.html',
  styleUrls: ['./topic-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicFormComponent {
  readonly #mobile = inject(MobileService);
  readonly #fb = inject(FormBuilder);
  readonly #ref = inject(ChangeDetectorRef);

  @Input() disabled: boolean = false;
  @Output() cancel = new EventEmitter<void>();
  @Output() save = new EventEmitter<{
    title: string;
    description: string;
    status: TOPIC_STATE;
  }>();
  form: FormGroup = this.#fb.group({
    title: [
      null,
      [
        Validators.minLength(NAME_MIN_LENGTH),
        Validators.maxLength(NAME_MAX_LENGTH),
        Validators.required
      ]
    ],
    description: [null, [Validators.maxLength(LONG_TEXT_MAX_LENGTH), Validators.required]],
    status: [TOPIC_STATE.ACTIVE, [Validators.required]]
  });

  isMobile: boolean = this.#mobile.isMobile();

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly TOPIC_STATE = TOPIC_STATE;
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly DESCRIPTION_LENGTH = 1024;

  @Input() set title(title: string) {
    if (!title) {
      return;
    }

    this._title.setValue(title);
  }

  @Input() set description(description: string) {
    if (!description) {
      return;
    }

    this._description.setValue(description);
  }

  @Input() set status(status: TOPIC_STATE) {
    if (!status) {
      return;
    }

    this._status.setValue(status);
  }

  get _title() {
    return this.form.get('title') as FormControl;
  }

  get _description() {
    return this.form.get('description') as FormControl;
  }

  get _status() {
    return this.form.get('status') as FormControl;
  }

  _confirm() {
    if (this.form.invalid) {
      this.#ref.detectChanges();
      return;
    }

    this.save.emit({
      title: this._title.value ? this._title.value.trim() : '',
      description: this._description.value ? this._description.value.trim() : '',
      status: this._status.value
    });
  }

  _cancel() {
    this.cancel.emit();
  }
}
