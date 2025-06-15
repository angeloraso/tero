import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SharedModules } from '@app/shared';
import { BizyPopupService } from '@bizy/core';
import { PHONE_MAX_LENGTH, PHONE_MIN_LENGTH } from './../../../core/constants';

@Component({
  selector: 'tero-user-phone-popup',
  templateUrl: 'user-phone-popup.html',
  styleUrls: ['user-phone-popup.css'],
  imports: SharedModules,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPhonePopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #fb = inject(FormBuilder);

  readonly PHONE_MIN_LENGTH = PHONE_MIN_LENGTH;
  readonly PHONE_MAX_LENGTH = PHONE_MAX_LENGTH;

  readonly #form = this.#fb.group({
    phone: [null, [Validators.minLength(this.PHONE_MIN_LENGTH), Validators.maxLength(this.PHONE_MAX_LENGTH), Validators.required]]
  });

  get phone() {
    return this.#form.get('phone') as FormControl;
  }

  ngOnInit() {
    const data = this.#popup.getData<{ phone: string }>();
    if (data && data.phone) {
      this.phone.setValue(data.phone);
    }
  }

  close() {
    this.#popup.close();
  }

  apply() {
    if (this.#form.invalid) {
      return;
    }

    this.#popup.close({ response: this.phone.value });
  }
}
