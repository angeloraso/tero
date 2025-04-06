import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SharedModules } from '@app/shared';
import { BizyPopupService } from '@bizy/core';
import { LONG_TEXT_MAX_LENGTH } from '@core/constants';
import { Rating } from '@core/model';
@Component({
  selector: 'tero-rating-popup',
  templateUrl: 'rating-popup.html',
  styleUrls: ['rating-popup.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: SharedModules
})
export class RatingPopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #fb = inject(FormBuilder);

  readonly LONG_TEXT_MAX_LENGTH = LONG_TEXT_MAX_LENGTH;

  readonly #form = this.#fb.group({
    value: [null, [Validators.required]],
    description: ['', [Validators.maxLength(this.LONG_TEXT_MAX_LENGTH)]]
  });

  showDelete: boolean = false;

  get value() {
    return this.#form.get('value') as FormControl<Rating | null>;
  }

  get description() {
    return this.#form.get('description') as FormControl;
  }

  ngOnInit() {
    const data = this.#popup.getData<{ value: Rating; description: string; accountId: string }>();

    if (data.value) {
      this.value.setValue(data.value);
      this.showDelete = true;
    }

    if (data.description) {
      this.description.setValue(data.description);
    }
  }

  close() {
    this.#popup.close();
  }

  onDelete() {
    this.#popup.close({ response: 'delete' });
  }

  apply() {
    if (this.#form.invalid) {
      return;
    }

    this.#popup.close({
      response: {
        value: this.value.value,
        description: this.description.value
      }
    });
  }
}
