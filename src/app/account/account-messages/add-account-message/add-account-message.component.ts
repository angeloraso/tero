import { PATH as ACCOUNT_PATH } from '@account/account.routing';
import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import {
  BIZY_TAG_TYPE,
  BizyFormComponent,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { UsersPopupComponent } from '@components/users-popup';
import { BODY_MAX_LENGTH, MAX_MESSAGE_USERS, NAME_MAX_LENGTH, NAME_MIN_LENGTH, TOPIC_SUBSCRIPTION } from '@core/constants';
import { ERROR, IUser } from '@core/model';
import { AccountMessagesService, MobileService, UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
import { es } from './i18n';

@Component({
  selector: 'tero-add-account-message',
  templateUrl: './add-account-message.html',
  styleUrls: ['./add-account-message.css'],
  imports: SharedModules
})
export class AddAccountMessageComponent implements OnInit {
  @ViewChild(BizyFormComponent) formComponent: BizyFormComponent | null = null;
  readonly #accountMessagesService = inject(AccountMessagesService);
  readonly #router = inject(BizyRouterService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #toast = inject(BizyToastService);
  readonly #log = inject(BizyLogService);
  readonly #home = inject(HomeService);
  readonly #translate = inject(BizyTranslateService);
  readonly #fb = inject(FormBuilder);
  readonly #mobile = inject(MobileService);
  readonly #popup = inject(BizyPopupService);
  readonly #auth = inject(AuthService);
  readonly #usersService = inject(UsersService);

  loading: boolean = false;
  accountEmail = this.#auth.getEmail()!;
  isConfig: boolean = false;
  currentUser: IUser | null = null;

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly BODY_MAX_LENGTH = BODY_MAX_LENGTH;

  readonly #form = this.#fb.group({
    users: [null, [Validators.required]],
    title: [null, [Validators.minLength(NAME_MIN_LENGTH), Validators.maxLength(NAME_MAX_LENGTH), Validators.required]],
    body: [null, [Validators.maxLength(BODY_MAX_LENGTH)]]
  });

  async ngOnInit() {
    try {
      this.loading = true;
      this.#translate.loadTranslations(es);
      this.#home.hideTabs();
      const [isConfig, currentUser] = await Promise.all([this.#usersService.isConfig(), this.#usersService.getCurrentUser()]);

      this.isConfig = isConfig;
      this.currentUser = currentUser;

      const user = this.#router.getQueryParam(this.#activatedRoute, 'user');
      if (user) {
        this.users.setValue([JSON.parse(user)]);
        this.users.disable();
      }
    } catch (error) {
      this.#log.error({
        fileName: 'add-account-message.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  get users() {
    return this.#form.get('users') as FormControl;
  }

  get title() {
    return this.#form.get('title') as FormControl;
  }

  get body() {
    return this.#form.get('body') as FormControl;
  }

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.ACCOUNT}/${ACCOUNT_PATH.ACCOUNT_MESSAGES}` });
  }

  openUsersPopup() {
    if (this.loading || this.users.disabled || !this.currentUser) {
      return;
    }

    this.#popup.open<{ users: Array<{ name: string; email: string }> }>(
      {
        component: UsersPopupComponent,
        fullScreen: true,
        data: {
          emails: this.users.value ? this.users.value.map((_user: { email: string }) => _user.email) : [],
          maxLimit: this.isConfig ? 0 : MAX_MESSAGE_USERS,
          currentUser: this.currentUser
        }
      },
      async res => {
        try {
          if (res && res.users) {
            if (res.users.length > 0) {
              this.users.setValue(res.users);
            } else {
              this.users.setValue(null);
            }
          }
        } catch (error) {
          this.#log.error({
            fileName: 'add-account-message.component',
            functionName: 'openUsersPopup',
            param: error
          });
          this.#toast.danger();
        }
      }
    );
  }

  async save() {
    try {
      if (this.#form.invalid || this.loading) {
        this.formComponent?.setTouched();
        return;
      }

      const emails: Array<string> = this.users.value.map((_user: { email: string }) => _user.email);
      if (emails.length === 0) {
        return;
      }

      this.loading = true;

      const title = this.title.value.trim();

      await this.#accountMessagesService.postMessage({
        title,
        body: this.body.value ? this.body.value.trim() : null,
        emails
      });

      const promises: Array<Promise<void>> = [];

      this.users.value.forEach((user: { name: string; email: string }) => {
        if (user && user.email) {
          promises.push(
            this.#mobile.sendPushNotification({
              topicId: `${TOPIC_SUBSCRIPTION.USER_NEW_MESSAGE}${user.email}`,
              title: `${this.#translate.get('ADD_ACCOUNT_MESSAGE.USER_NEW_MESSAGE_NOTIFICATION.TITLE')}: ${user.name}`,
              body: title
            })
          );
        }
      });

      await Promise.all(promises);

      this.goBack();
    } catch (error) {
      this.#log.error({
        fileName: 'add-account-message.component',
        functionName: 'save',
        param: error
      });

      if (error instanceof Error && error.message === ERROR.NOTIFICATION_PERMISSIONS) {
        this.#toast.warning(this.#translate.get('CORE.ERROR.NOTIFICATION_PERMISSIONS'));
        return;
      }

      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
