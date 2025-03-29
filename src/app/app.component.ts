import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import { BizyLogService, BizyPopupService, BizyRouterService, BizyToastService, BizyTranslateService, LANGUAGE } from '@bizy/core';
import { AnalyticsService } from '@core/analytics';
import { es } from '@core/i18n';
import { ERROR } from '@core/model';
import { DatabaseService, MobileService, UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { PATH } from './app.routing';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
  imports: [...SharedModules, RouterOutlet]
})
export class AppComponent implements OnInit {
  readonly #mobile = inject(MobileService);
  readonly #auth = inject(AuthService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #database = inject(DatabaseService);
  readonly #popup = inject(BizyPopupService);
  readonly #usersService = inject(UsersService);
  readonly #router = inject(BizyRouterService);
  readonly #translate = inject(BizyTranslateService);
  readonly #analytics = inject(AnalyticsService);

  readonly ROOT_PATHS = [
    `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORS}`,
    `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}`,
    `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORHOOD}`,
    `/${APP_PATH.HOME}/${HOME_PATH.CONTACTS}`,
    `/${APP_PATH.HOME}/${HOME_PATH.CONFIG}`,
    `/${APP_PATH.AUTH}`
  ];

  async ngOnInit() {
    try {
      registerLocaleData(localeEs, 'es');

      this.#translate.addLangs([LANGUAGE.SPANISH]);
      this.#translate.setDefault(LANGUAGE.SPANISH);
      this.#translate.use(LANGUAGE.SPANISH);
      this.#translate.loadTranslations(es);

      if (this.#mobile.isMobile()) {
        await this.#mobile.init();
        this.#mobile.backButton$.subscribe(() => {
          if (this.#popup.openedPopups() > 0) {
            this.#popup.closeAll();
          } else if (this.ROOT_PATHS.includes(this.#router.getURL())) {
            this.#mobile.exit();
          } else {
            this.#router.goBack();
          }
        });

        this.#mobile.hideSplash();
      }

      this.#auth.signedIn$.subscribe(async signedIn => {
        if (!signedIn) {
          this.#database.destroy();
          this.#router.goTo({ path: `/${PATH.AUTH}` });
        } else {
          try {
            const user = await this.#usersService.getCurrentUser();
            await this.#analytics.setUserId(String(user.id));
          } catch (error) {
            this.#log.error({
              fileName: 'app.component',
              functionName: 'getCurrentUser',
              param: error
            });

            if (error instanceof Error && error.message === ERROR.ITEM_NOT_FOUND) {
              await this.#usersService.postUser();
            } else {
              this.#toast.danger();
            }
          }

          if (this.#router.getURL() === `/${PATH.AUTH}`) {
            this.#router.goTo({ path: `/${PATH.HOME}` });
          }
        }
      });
    } catch (error: unknown) {
      this.#log.error({
        fileName: 'app.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    }
  }
}
