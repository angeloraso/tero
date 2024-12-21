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
    value: FormControl<any>;
    description: FormControl<any>;
  }>;

  showDelete: boolean = false;
  readonly LONG_TEXT_MAX_LENGTH = LONG_TEXT_MAX_LENGTH;

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(FormBuilder) private fb: FormBuilder
  ) {
    this.form = this.fb.group({
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

  ngOnInit() {
    const data = this.popup.getData<{ value: Rating; description: string; accountId: string }>();

    if (data.value) {
      this.value.setValue(data.value);
      this.showDelete = true;
    }

    if (data.description) {
      this.description.setValue(data.description);
    }
  }

  close() {
    this.popup.close();
  }

  onDelete() {
    this.popup.close({ response: 'delete' });
  }

  apply() {
    if (this.form.invalid) {
      return;
    }

    this.popup.close({
      response: {
        value: this.value.value,
        description: this.description.value
      }
    });
  }
}
