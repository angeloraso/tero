import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { BizyLogService, BizyToastService } from '@bizy/services';
import { AuthService } from '@core/auth/auth.service';

@Component({
  selector: 'tero-sign-in',
  templateUrl: './sign-in.html',
  styleUrls: ['./sign-in.css']
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
