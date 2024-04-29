import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { BizyPopupService, BizyTranslateService } from '@bizy/services';
import { ConfirmPopupComponent } from '@components/confirm-popup';
import { AuthService } from '@core/auth/auth.service';
import { COUNTRIES, LOGO_PATH } from '@core/constants';
import { COUNTRY_CODE } from '@core/model';
import { UserSettingsService } from '@core/services';
import { Subscription } from 'rxjs';
import { AboutPopupComponent } from './about-popup/about-popup.component';

@Component({
  selector: 'tero-config',
  templateUrl: './config.html',
  styleUrls: ['./config.css']
})
export class ConfigComponent implements OnInit, OnDestroy {
  #subscription = new Subscription();
  loading = false;
  form: FormGroup<{
    userCountry: FormControl<string | null>;
  }>;

  profilePic = LOGO_PATH;

  readonly COUNTRIES = COUNTRIES;

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(AuthService) private auth: AuthService,
    @Inject(FormBuilder) private fb: FormBuilder,
    @Inject(UserSettingsService) private userSettings: UserSettingsService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService
  ) {
    this.form = this.fb.group({
      userCountry: ['', [Validators.required]]
    });

    const profilePic = this.auth.getProfilePicture();
    if (profilePic) {
      this.profilePic = profilePic;
    }
  }

  async ngOnInit() {
    try {
      this.loading = true;
      const userCountry = await this.userSettings.getCountry();
      this.userCountry.setValue(userCountry);
    } catch (error) {
      console.debug(error);
    } finally {
      this.loading = false;
    }
  }

  get userCountry() {
    return this.form.get('userCountry') as FormControl<string>;
  }

  async setCountry(country: string | number) {
    try {
      if (!country) {
        return;
      }

      this.loading = true;

      await this.userSettings.putCountry(country as COUNTRY_CODE);
    } catch (error) {
      console.log(error);
    } finally {
      this.loading = false;
    }
  }

  openPopup(): void {
    this.popup.open({ component: AboutPopupComponent });
  }

  onSignOut(): void {
    if (this.loading) {
      return;
    }

    this.popup.open<boolean>(
      {
        component: ConfirmPopupComponent,
        data: {
          title: this.translate.get('CONFIG.SIGN_OUT_POPUP.TITLE'),
          msg: `${this.translate.get('CONFIG.SIGN_OUT_POPUP.MSG')}: ${this.auth.getEmail()}`
        }
      },
      res => {
        if (res) {
          this.loading = true;
          this.auth.signOut().finally(() => (this.loading = false));
        }
      }
    );
  }

  ngOnDestroy() {
    this.#subscription.unsubscribe;
  }
}
