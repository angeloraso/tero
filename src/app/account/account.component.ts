import {
  AboutPopupComponent,
  UserAliasCBUPopupComponent,
  UserLotPopupComponent,
  UserNamePopupComponent,
  UserPhonePopupComponent
} from '@account/components';
import { Component, inject, OnInit } from '@angular/core';
import { SharedModules } from '@app/shared';
import { AuthService } from '@auth/auth.service';
import {
  BIZY_SKELETON_SHAPE,
  BIZY_TAG_TYPE,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { LOGO_PATH } from '@core/constants';
import { IUser, USER_STATE } from '@core/model';
import { UsersService } from '@core/services';
import { HomeService } from '@home/home.service';
import { PATH } from './account.routing';
import { es } from './i18n';

@Component({
  selector: 'tero-account',
  templateUrl: './account.html',
  styleUrls: ['./account.css'],
  imports: SharedModules
})
export class AccountComponent implements OnInit {
  readonly #router = inject(BizyRouterService);
  readonly #popup = inject(BizyPopupService);
  readonly #auth = inject(AuthService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #translate = inject(BizyTranslateService);
  readonly #usersService = inject(UsersService);
  readonly #home = inject(HomeService);
  loading = false;

  readonly LOGO_PATH = LOGO_PATH;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly USER_STATE = USER_STATE;
  readonly DEFAULT_USER_ID = '00000000000000';
  readonly BIZY_SKELETON_SHAPE = BIZY_SKELETON_SHAPE;
  isConfig: boolean = false;
  isNeighbor: boolean = false;
  profilePic: string | null = null;
  name: string = '';
  email: string = '';
  users: Array<IUser> = [];
  pendingUsers: Array<IUser> = [];
  currentUser: IUser | null = null;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.showTabs();
      this.#translate.loadTranslations(es);
      this.name = this.#auth.getName() ?? '';
      this.email = this.#auth.getEmail() ?? '';

      const [profilePic, currentUser, isConfig, isNeighbor] = await Promise.all([
        this.#auth.getProfilePicture(),
        this.#usersService.getCurrentUser(),
        this.#usersService.isConfig(),
        this.#usersService.isNeighbor()
      ]);

      this.profilePic = profilePic;

      this.currentUser = currentUser;

      this.isConfig = isConfig;

      this.isNeighbor = isNeighbor;

      if (this.isConfig) {
        this.users = await this.#usersService.getUsers();
        this.pendingUsers = this.users.filter(_user => _user.status === USER_STATE.PENDING);
      }
    } catch (error) {
      this.#log.error({
        fileName: 'account.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  openAboutPopup(): void {
    this.#popup.open({ component: AboutPopupComponent });
  }

  openUserNamePopup(): void {
    if (!this.currentUser) {
      return;
    }

    this.#popup.open<string>(
      {
        component: UserNamePopupComponent,
        data: { name: this.currentUser.name }
      },
      async name => {
        try {
          if (name && this.currentUser) {
            this.loading = true;
            await this.#usersService.putUser({ ...this.currentUser, name });
            this.currentUser.name = name;
          }
        } catch (error) {
          this.#log.error({
            fileName: 'account.component',
            functionName: 'openUserNamePopup',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  openUserPhonePopup(): void {
    this.#popup.open<string>(
      {
        component: UserPhonePopupComponent,
        data: { phone: this.currentUser?.phone || null }
      },
      async phone => {
        try {
          if (phone && this.currentUser) {
            this.loading = true;
            await this.#usersService.putUser({ ...this.currentUser, phone });
            this.currentUser.phone = phone;
          }
        } catch (error) {
          this.#log.error({
            fileName: 'account.component',
            functionName: 'openUserPhonePopup',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  openUserLotPopup(): void {
    this.#popup.open<number>(
      {
        component: UserLotPopupComponent,
        data: { lot: this.currentUser?.lot || null }
      },
      async lot => {
        try {
          if (lot && this.currentUser) {
            this.loading = true;
            await this.#usersService.putUser({ ...this.currentUser, lot });
            this.currentUser.lot = lot;
          }
        } catch (error) {
          this.#log.error({
            fileName: 'account.component',
            functionName: 'openUserLotPopup',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  openUserAliasCBUPopup(): void {
    this.#popup.open<string>(
      {
        component: UserAliasCBUPopupComponent,
        data: { aliasCBU: this.currentUser?.aliasCBU || null }
      },
      async aliasCBU => {
        try {
          if (aliasCBU && this.currentUser) {
            this.loading = true;
            await this.#usersService.putUser({ ...this.currentUser, aliasCBU });
            this.currentUser.aliasCBU = aliasCBU;
          }
        } catch (error) {
          this.#log.error({
            fileName: 'account.component',
            functionName: 'openUserAliasCBUPopup',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  goToUsers(): void {
    if (this.loading || !this.isConfig) {
      return;
    }

    this.#router.goTo({ path: PATH.USERS });
  }

  goToNotificationSettings() {
    if (this.loading || !this.isNeighbor) {
      return;
    }

    this.#router.goTo({ path: PATH.NOTIFICATION_SETTINGS });
  }

  goToMessages() {
    if (this.loading || !this.isNeighbor) {
      return;
    }

    this.#router.goTo({ path: PATH.ACCOUNT_MESSAGES });
  }

  onSignOut(): void {
    if (this.loading) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('ACCOUNT.SIGN_OUT_POPUP.TITLE'),
          msg: `${this.#translate.get('ACCOUNT.SIGN_OUT_POPUP.MSG')}: ${this.#auth.getEmail()}`
        }
      },
      res => {
        if (res) {
          this.loading = true;
          this.#auth.signOut().finally(() => (this.loading = false));
        }
      }
    );
  }
}
