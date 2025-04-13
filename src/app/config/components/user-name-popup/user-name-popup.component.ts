import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SharedModules } from '@app/shared';
import { BizyPopupService } from '@bizy/core';
import { NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@core/constants';

@Component({
  selector: 'tero-user-name-popup',
  templateUrl: 'user-name-popup.html',
  styleUrls: ['user-name-popup.css'],
  imports: SharedModules,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserNamePopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #fb = inject(FormBuilder);

  readonly MIN_LENGTH = NAME_MIN_LENGTH;
  readonly MAX_LENGTH = NAME_MAX_LENGTH;

  readonly #form = this.#fb.group({
    name: [null, [Validators.minLength(this.MIN_LENGTH), Validators.maxLength(this.MAX_LENGTH), Validators.required]]
  });

  get name() {
    return this.#form.get('name') as FormControl;
  }

  ngOnInit() {
    const data = this.#popup.getData<{ name: string }>();
    if (data && data.name) {
      this.name.setValue(data.name);
    }
  }

  close() {
    this.#popup.close();
  }

  apply() {
    if (this.#form.invalid) {
      return;
    }

    this.#popup.close({ response: this.name.value });
  }
}
