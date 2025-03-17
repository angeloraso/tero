import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SharedModules } from '@app/shared';
import { BizyPopupService } from '@bizy/core';
import { LOTS } from '@core/constants';

@Component({
    selector: 'tero-user-lot-popup',
    templateUrl: 'user-lot-popup.html',
    styleUrls: ['user-lot-popup.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: SharedModules
})
export class UserLotPopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #fb = inject(FormBuilder);

  readonly MIN = 1;
  readonly MAX = LOTS.length;

  form = this.#fb.group({
    lot: [null, [Validators.min(this.MIN), Validators.max(this.MAX), Validators.required]]
  });

  get lot() {
    return this.form.get('lot') as FormControl<string | number | null>;
  }

  ngOnInit() {
    const data = this.#popup.getData<{ lot: number }>();
    if (data && data.lot) {
      this.lot.setValue(data.lot);
    }
  }

  close() {
    this.#popup.close();
  }

  apply() {
    if (this.form.invalid) {
      return;
    }

    this.#popup.close({ response: this.lot.value });
  }
}
