import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BizyPopupService } from '@bizy/services';
import { LOTS } from '@core/constants';

@Component({
  selector: 'tero-user-lot-popup',
  templateUrl: 'user-lot-popup.html',
  styleUrls: ['user-lot-popup.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserLotPopupComponent implements OnInit {
  form: FormGroup<{
    lot: FormControl<any>;
  }>;

  readonly MIN = 1;
  readonly MAX = LOTS.length;

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(FormBuilder) private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      lot: [null, [Validators.min(this.MIN), Validators.max(this.MAX), Validators.required]]
    });
  }

  get lot() {
    return this.form.get('lot') as FormControl<string | number>;
  }

  ngOnInit() {
    const data = this.popup.getData<{ lot: string }>();
    if (data && data.lot) {
      this.lot.setValue(data.lot);
    }
  }

  close() {
    this.popup.close();
  }

  apply() {
    if (this.form.invalid) {
      return;
    }

    this.popup.close({ response: this.lot.value });
  }
}
