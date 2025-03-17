import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { SharedModules } from '@app/shared';
import { BizyPopupService } from '@bizy/core';

@Component({
    selector: 'tero-user-alias-cbu-popup',
    templateUrl: 'user-alias-cbu-popup.html',
    styleUrls: ['user-alias-cbu-popup.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: SharedModules
})
export class UserAliasCBUPopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  readonly #fb = inject(FormBuilder);

  form = this.#fb.group({
    aliasCBU: ['', [Validators.required]]
  });

  get aliasCBU() {
    return this.form.get('aliasCBU') as FormControl<string | number>;
  }

  ngOnInit() {
    const data = this.#popup.getData<{ aliasCBU: string }>();
    if (data && data.aliasCBU) {
      this.aliasCBU.setValue(data.aliasCBU);
    }
  }

  close() {
    this.#popup.close();
  }

  apply() {
    if (this.form.invalid) {
      return;
    }

    this.#popup.close({ response: this.aliasCBU.value });
  }
}
