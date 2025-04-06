import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SharedModules } from '@app/shared';
import { BizyPopupService } from '@bizy/core';
import { NAME_MAX_LENGTH } from '@core/constants';
import { INeighbor } from '@core/model';
@Component({
  selector: 'tero-register-payment-popup',
  templateUrl: 'register-payment-popup.html',
  styleUrls: ['register-payment-popup.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: SharedModules
})
export class RegisterPaymentPopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #fb = inject(FormBuilder);

  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;

  readonly #form = this.#fb.group({
    transactionId: [null, [Validators.maxLength(this.NAME_MAX_LENGTH)]]
  });

  neighbor: INeighbor | null = null;

  get transactionId() {
    return this.#form.get('transactionId') as FormControl;
  }

  ngOnInit() {
    const data = this.#popup.getData<{ neighbor: INeighbor; transactionId: string }>();

    this.neighbor = data?.neighbor || null;

    if (data?.transactionId) {
      this.transactionId.setValue(data.transactionId);
    }
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
        transactionId: this.transactionId.value
      }
    });
  }
}
