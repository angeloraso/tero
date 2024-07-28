import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BizyPopupService } from '@bizy/services';
import { LONG_TEXT_MAX_LENGTH } from '@core/constants';
import { Rating } from '@core/model';
@Component({
  selector: 'tero-rating-popup',
  templateUrl: 'rating-popup.html',
  styleUrls: ['rating-popup.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RatingPopupComponent implements OnInit {
  form: FormGroup<{
    accountId: FormControl<any>;
    value: FormControl<any>;
    description: FormControl<any>;
  }>;

  readonly LONG_TEXT_MAX_LENGTH = LONG_TEXT_MAX_LENGTH;

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(FormBuilder) private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      accountId: ['', [Validators.required]],
      value: [null, [Validators.required]],
      description: ['', [Validators.maxLength(this.LONG_TEXT_MAX_LENGTH)]]
    });
  }

  get value() {
    return this.form.get('value') as FormControl<Rating>;
  }

  get description() {
    return this.form.get('description') as FormControl;
  }

  get accountId() {
    return this.form.get('accountId') as FormControl;
  }

  ngOnInit() {
    const data = this.popup.getData<{ value: Rating; description: string; accountId: string }>();

    if (data.value) {
      this.value.setValue(data.value);
    }

    if (data.description) {
      this.description.setValue(data.description);
    }

    if (data.accountId) {
      this.accountId.setValue(data.accountId);
    }
  }

  close() {
    this.popup.close();
  }

  apply() {
    if (this.form.invalid) {
      return;
    }

    this.popup.close({
      response: {
        accountId: this.accountId.value,
        value: this.value.value,
        description: this.description.value
      }
    });
  }
}
