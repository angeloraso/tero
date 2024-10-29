import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BizyPopupService } from '@bizy/services';

@Component({
  selector: 'tero-user-phone-popup',
  templateUrl: 'user-phone-popup.html',
  styleUrls: ['user-phone-popup.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserPhonePopupComponent implements OnInit {
  form: FormGroup<{
    phone: FormControl<any>;
  }>;

  readonly MIN_LENGTH = 10;
  readonly MAX_LENGTH = 10;

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(FormBuilder) private fb: FormBuilder
  ) {
    this.form = this.fb.group({
      phone: [
        null,
        [
          Validators.minLength(this.MIN_LENGTH),
          Validators.maxLength(this.MAX_LENGTH),
          Validators.required
        ]
      ]
    });
  }

  get phone() {
    return this.form.get('phone') as FormControl<string | number>;
  }

  ngOnInit() {
    const data = this.popup.getData<{ phone: string }>();
    if (data && data.phone) {
      this.phone.setValue(data.phone);
    }
  }

  close() {
    this.popup.close();
  }

  apply() {
    if (this.form.invalid) {
      return;
    }

    this.popup.close({ response: this.phone.value });
  }
}
