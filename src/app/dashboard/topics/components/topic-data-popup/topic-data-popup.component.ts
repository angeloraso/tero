import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SharedModules } from '@app/shared';
import { BizyPopupService, BizyValidatorService } from '@bizy/core';
import { EMAIL_MAX_LENGTH, NAME_MAX_LENGTH, TEL_MAX_LENGTH } from '@core/constants';
import { TOPIC_DATA_TYPE } from '@core/model';
@Component({
    selector: 'tero-topic-data-popup',
    templateUrl: 'topic-data-popup.html',
    styleUrls: ['topic-data-popup.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: SharedModules
})
export class TopicDataPopupComponent {
  readonly #popup = inject(BizyPopupService);
  readonly #fb = inject(FormBuilder);
  readonly #validator = inject(BizyValidatorService);

  readonly TOPIC_DATA_TYPE = TOPIC_DATA_TYPE;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;

  dataType: 'tel' | 'text' | 'email' | 'number' = 'text';
  MAX_LENGTH = NAME_MAX_LENGTH;

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

  setDataType(type: TOPIC_DATA_TYPE) {
    if (!type) {
      return;
    }

    this.type.setValue(type);
    const defaultValidators = [Validators.required];
    if (type === TOPIC_DATA_TYPE.EMAIL) {
      this.dataType = 'email';
      this.value.setValidators(
        defaultValidators.concat([
          Validators.maxLength(EMAIL_MAX_LENGTH),
          this.#validator.emailValidator()
        ])
      );
      this.MAX_LENGTH = EMAIL_MAX_LENGTH;
    } else if (type === TOPIC_DATA_TYPE.TEL) {
      this.dataType = 'tel';
      this.value.setValidators(defaultValidators.concat(Validators.maxLength(TEL_MAX_LENGTH)));
      this.MAX_LENGTH = TEL_MAX_LENGTH;
    } else if (type === TOPIC_DATA_TYPE.NUMBER) {
      this.dataType = 'number';
      this.value.setValidators(defaultValidators.concat(this.#validator.numberValidator()));
      this.MAX_LENGTH = NAME_MAX_LENGTH;
    } else {
      this.dataType = 'text';
      this.value.setValidators(defaultValidators.concat(Validators.maxLength(NAME_MAX_LENGTH)));
      this.MAX_LENGTH = NAME_MAX_LENGTH;
    }

    this.value.updateValueAndValidity();
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
