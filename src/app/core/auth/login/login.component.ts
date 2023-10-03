import { Component, ElementRef, Inject, ViewChild } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { PATH } from '@app/app.routing';
import { AuthService } from '@core/auth/auth.service';
import { RouterService } from '@core/services';

@Component({
  selector: 'tero-login',
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  @ViewChild('password') passwordInput: ElementRef | null = null;

  form: UntypedFormGroup;
  public showError = false;
  showPassword = false;
  hideLogo = false;

  constructor(
    @Inject(AuthService) private authService: AuthService,
    @Inject(UntypedFormBuilder) private formBuilder: UntypedFormBuilder,
    @Inject(RouterService) private router: RouterService
  ) {
    this.form = this.formBuilder.group({
      email: ['', { updateOn: 'blur', validators: [Validators.email, Validators.required] }],
      password: ['', { updateOn: 'change', validators: [Validators.required] }]
    });
  }

  get email() {
    return this.form.get('email') as AbstractControl;
  }

  get password() {
    return this.form.get('password') as AbstractControl;
  }

  async onLogin() {
    if (this.email?.invalid || this.password?.invalid) {
      return;
    }

    this.authService
      .login({ email: this.email?.value, password: this.password?.value })
      .then(() => {
        this.router.goTo({ path: `/${PATH.MENU}` });
      })
      .catch(async error => {
        console.error(error);
      });
  }

  fixAutoFill(email: Event, password: any) {
    if (email) {
      this.email?.setValue((email.target as HTMLInputElement).value);
    }

    if (password) {
      this.password?.setValue(password);
    }
  }

  passwordEnter(event: any) {
    if (event.key === 'Enter') {
      this.onLogin();
    }
  }

  nextInput(event: any) {
    if (event.key === 'Enter' && this.passwordInput) {
      this.passwordInput.nativeElement.focus();
    }
  }
}
