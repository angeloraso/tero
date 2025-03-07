import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import { BizyLogService, BizyToastService, BizyTranslateService } from '@bizy/core';
import { es } from './i18n';

@Component({
    selector: 'tero-auth',
    templateUrl: './auth.html',
    styleUrls: ['./auth.css'],
    imports: [...SharedModules]
})
export class AuthComponent {
  readonly #auth = inject(AuthService)
  readonly #log = inject(BizyLogService)
  readonly #toast = inject(BizyToastService)
  readonly #ref = inject(ChangeDetectorRef)
  readonly #translate = inject(BizyTranslateService)
  loading = false;

  constructor() {
    this.#translate.loadTranslations(es);
  }

  async onSignIn() {
    try {
      if (this.loading) {
        return;
      }
      this.loading = true;
      this.#ref.detectChanges();
      await this.#auth.signIn();
    } catch (error) {
      this.#log.error({
        fileName: 'auth.component',
        functionName: 'onSignIn',
        param: error
      });

      this.#toast.danger();
      this.loading = false;
    }
  }
}
