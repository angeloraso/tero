import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BizyPopupService } from '@bizy/services';
import { NAME_MAX_LENGTH } from '@core/constants';
import { INeighbor } from '@core/model';
@Component({
  selector: 'tero-register-payment-popup',
  templateUrl: 'register-payment-popup.html',
  styleUrls: ['register-payment-popup.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RegisterPaymentPopupComponent implements OnInit {
  neighbor: INeighbor | null = null;
  form: FormGroup<{
    transactionId: FormControl<any>;
  }>;

  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(FormBuilder) private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      transactionId: [null, [Validators.maxLength(this.NAME_MAX_LENGTH)]]
    });
  }

  get transactionId() {
    return this.form.get('transactionId') as FormControl;
  }

  ngOnInit() {
    const data = this.popup.getData<{ neighbor: INeighbor; transactionId: string }>();

    this.neighbor = data.neighbor || null;

    if (data.transactionId) {
      this.transactionId.setValue(data.transactionId);
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
        transactionId: this.transactionId.value
      }
    });
  }
}
