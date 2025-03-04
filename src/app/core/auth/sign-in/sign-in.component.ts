import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { AuthService } from '@auth/auth.service';
import { BizyLogService, BizyToastService } from '@bizy/services';

@Component({
    selector: 'tero-sign-in',
    templateUrl: './sign-in.html',
    styleUrls: ['./sign-in.css'],
    standalone: false
})
export class SignInComponent {
  loading = false;

  constructor(
    @Inject(AuthService) private auth: AuthService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(ChangeDetectorRef) private ref: ChangeDetectorRef
  ) {}

  async onSignIn() {
    try {
      if (this.loading) {
        return;
      }
      this.loading = true;
      this.ref.detectChanges();
      await this.auth.signIn();
    } catch (error) {
      this.log.error({
        fileName: 'sign-in.component',
        functionName: 'onSignIn',
        param: error
      });

      this.toast.danger();
      this.loading = false;
    }
  }
}
