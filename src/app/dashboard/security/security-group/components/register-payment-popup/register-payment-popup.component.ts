import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SharedModules } from '@app/shared';
import { BizyPopupService, BizyTranslateService } from '@bizy/core';
import { LONG_TEXT_MAX_LENGTH, NAME_MAX_LENGTH } from '@core/constants';
import { INeighbor } from '@core/model';
import { es } from './i18n';

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
  readonly #translate = inject(BizyTranslateService);

  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly LONG_TEXT_MAX_LENGTH = LONG_TEXT_MAX_LENGTH;

  readonly #form = this.#fb.group({
    transactionId: [null, [Validators.maxLength(this.NAME_MAX_LENGTH)]],
    description: [null, [Validators.maxLength(this.LONG_TEXT_MAX_LENGTH)]]
  });

  neighbor: INeighbor | null = null;

  get transactionId() {
    return this.#form.get('transactionId') as FormControl;
  }

  get description() {
    return this.#form.get('description') as FormControl;
  }

  ngOnInit() {
    this.#translate.loadTranslations(es);
    const data = this.#popup.getData<{ neighbor: INeighbor; transactionId: string; description: string }>();

    this.neighbor = data?.neighbor || null;

    if (data?.transactionId) {
      this.transactionId.setValue(data.transactionId);
    }

    if (data?.description) {
      this.description.setValue(data.description);
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
        transactionId: this.transactionId.value,
        description: this.description.value
      }
    });
  }
}
