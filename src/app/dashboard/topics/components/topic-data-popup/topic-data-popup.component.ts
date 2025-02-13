import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { BizyPopupService } from '@bizy/services';
import { NAME_MAX_LENGTH } from '@core/constants';
import { TOPIC_DATA_TYPE } from '@core/model';
@Component({
  selector: 'tero-topic-data-popup',
  templateUrl: 'topic-data-popup.html',
  styleUrls: ['topic-data-popup.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicDataPopupComponent {
  readonly #popup = inject(BizyPopupService);
  readonly #fb = inject(FormBuilder);

  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly TOPIC_DATA_TYPE = TOPIC_DATA_TYPE;

  #form = this.#fb.group({
    key: ['', [Validators.maxLength(NAME_MAX_LENGTH), Validators.required]],
    value: ['', [Validators.maxLength(NAME_MAX_LENGTH), Validators.required]],
    type: [TOPIC_DATA_TYPE.DATA, [Validators.required]]
  });

  get key() {
    return this.#form.get('key') as FormControl;
  }

  get value() {
    return this.#form.get('value') as FormControl;
  }

  get type() {
    return this.#form.get('type') as FormControl;
  }

  close() {
    this.#popup.close();
  }

  apply() {
    if (this.#form.invalid) {
      return;
    }

    this.#popup.close({
      response: {
        key: String(this.key.value),
        value: String(this.value.value),
        type: this.type.value
      }
    });
  }
}
