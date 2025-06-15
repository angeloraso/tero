import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import { BizyLogService, BizyPopupService, BizyRouterService, BizyToastService, BizyTranslateService, LANGUAGE } from '@bizy/core';
import { AnalyticsService } from '@core/analytics';
import { SECURITY_GROUPS, TOPIC_SUBSCRIPTION } from '@core/constants';
import { es } from '@core/i18n';
import { ERROR } from '@core/model';
import { DatabaseService, MobileService, NeighborsService, UsersService } from '@core/services';
import { ENV } from '@env/environment';
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
  readonly #neighborsService = inject(NeighborsService);

  readonly ROOT_PATHS = [
    `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORS}`,
    `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}`,
    `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORHOOD}`,
    `/${APP_PATH.HOME}/${HOME_PATH.CONTACTS}`,
    `/${APP_PATH.HOME}/${HOME_PATH.ACCOUNT}`,
    `/${APP_PATH.AUTH}`
  ];

  async ngOnInit() {
    try {
      registerLocaleData(localeEs, 'es');

      this.#translate.addLangs([LANGUAGE.SPANISH]);
      this.#translate.setDefault(LANGUAGE.SPANISH);
      this.#translate.use(LANGUAGE.SPANISH);
      this.#translate.loadTranslations(es);

      if (ENV.mobile) {
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

        await this.#mobile.hideSplash();
      }

      this.#auth.signedIn$.subscribe(async signedIn => {
        if (!signedIn) {
          this.#database.destroy();
          this.#router.goTo({ path: `/${PATH.AUTH}` });
        } else {
          try {
            const user = await this.#usersService.getCurrentUser();
            await this.#analytics.setUserId(String(user.id));

            const neighbor = await this.#neighborsService.getNeighborByEmail(user.email);
            // Fix possible security group changes
            await this.#unsubscribeFromSecurityGroupSubscription();

            if (user.topicSubscriptions) {
              user.topicSubscriptions.forEach(async _topicSubscription => {
                try {
                  if (_topicSubscription === TOPIC_SUBSCRIPTION.GROUP_SECURITY_INVOICE && neighbor && neighbor.security && neighbor.group) {
                    await this.#mobile.subscribeToTopic(`${_topicSubscription}${neighbor.group}`);
                  } else if (
                    _topicSubscription === TOPIC_SUBSCRIPTION.USER_SECURITY_INVOICE &&
                    neighbor &&
                    neighbor.email &&
                    neighbor.security &&
                    neighbor.group
                  ) {
                    await this.#mobile.subscribeToTopic(`${_topicSubscription}${user.email}`);
                  } else {
                    await this.#mobile.subscribeToTopic(_topicSubscription);
                  }
                } catch (error) {
                  this.#log.error({
                    fileName: 'app.component',
                    functionName: 'subscribeToTopic',
                    param: error
                  });

                  if (error instanceof Error && error.message === ERROR.NOTIFICATION_PERMISSIONS) {
                    if (this.#router.getURL() === `/${PATH.AUTH}`) {
                      this.#router.goTo({ path: `/${PATH.HOME}` });
                    }
                    return Promise.resolve();
                  }

                  throw error;
                }
              });
            } else {
              user.topicSubscriptions = [TOPIC_SUBSCRIPTION.GARBAGE];
              await this.#usersService.putUser(user);
              try {
                await this.#mobile.subscribeToTopic(TOPIC_SUBSCRIPTION.GARBAGE);
              } catch (error) {
                this.#log.error({
                  fileName: 'app.component',
                  functionName: 'subscribeToTopic',
                  param: error
                });

                if (error instanceof Error && error.message === ERROR.NOTIFICATION_PERMISSIONS) {
                  if (this.#router.getURL() === `/${PATH.AUTH}`) {
                    this.#router.goTo({ path: `/${PATH.HOME}` });
                  }
                  return Promise.resolve();
                }

                throw error;
              }
            }
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

  #unsubscribeFromSecurityGroupSubscription = () => {
    try {
      return Promise.all(SECURITY_GROUPS.map(_group => this.#mobile.unsubscribeFromTopic(`${TOPIC_SUBSCRIPTION.GROUP_SECURITY_INVOICE}${_group}`)));
    } catch (error) {
      this.#log.error({
        fileName: 'app.component',
        functionName: 'unsubscribeFromSecuritySubscription',
        param: error
      });
      return Promise.resolve();
    }
  };
}
