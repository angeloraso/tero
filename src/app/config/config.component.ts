import { Component, Inject, OnInit } from '@angular/core';
import { AuthService } from '@auth/auth.service';
import { BIZY_TAG_TYPE } from '@bizy/components';
import {
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import {
  AboutPopupComponent,
  UserLotPopupComponent,
  UserPhonePopupComponent
} from '@config/components';
import { DEFAULT_USER_PICTURE, LOGO_PATH } from '@core/constants';
import { IUser, USER_STATE } from '@core/model';
import { UsersService } from '@core/services';
import { PopupComponent } from '@shared/components';
import { PATH } from './config.routing';

@Component({
    selector: 'tero-config',
    templateUrl: './config.html',
    styleUrls: ['./config.css'],
    standalone: false
})
export class ConfigComponent implements OnInit {
  loading = false;

  defaultProfilePic: string = `/assets/img/${DEFAULT_USER_PICTURE}`;
  readonly LOGO_PATH = LOGO_PATH;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly USER_STATE = USER_STATE;
  readonly DEFAULT_USER_ID = '00000000000000';
  isConfig: boolean = false;
  profilePic: string | null = null;
  name: string = '';
  email: string = '';
  users: Array<IUser> = [];
  pendingUsers: Array<IUser> = [];
  currentUser: IUser | null = null;

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(AuthService) private auth: AuthService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(UsersService) private usersService: UsersService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.name = this.auth.getName() ?? '';
      this.email = this.auth.getEmail() ?? '';

      const [profilePic, currentUser, isConfig] = await Promise.all([
        this.auth.getProfilePicture(),
        this.usersService.getCurrentUser(),
        this.usersService.isConfig()
      ]);

      this.profilePic = profilePic;

      this.currentUser = currentUser;

      this.isConfig = isConfig;

      if (this.isConfig) {
        this.users = await this.usersService.getUsers();
        this.pendingUsers = this.users.filter(_user => _user.status === USER_STATE.PENDING);
      }
    } catch (error) {
      this.log.error({
        fileName: 'config.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }

  openAboutPopup(): void {
    this.popup.open({ component: AboutPopupComponent });
  }

  openUserPhonePopup(): void {
    this.popup.open<string>(
      {
        component: UserPhonePopupComponent,
        data: { phone: this.currentUser?.phone || null }
      },
      async phone => {
        try {
          if (phone && this.currentUser) {
            this.loading = true;
            await this.usersService.putUser({ ...this.currentUser, phone });
            this.currentUser.phone = phone;
          }
        } catch (error) {
          this.log.error({
            fileName: 'config.component',
            functionName: 'openUserPhonePopup',
            param: error
          });
          this.toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  openUserLotPopup(): void {
    this.popup.open<number>(
      {
        component: UserLotPopupComponent,
        data: { lot: this.currentUser?.lot || null }
      },
      async lot => {
        try {
          if (lot && this.currentUser) {
            this.loading = true;
            await this.usersService.putUser({ ...this.currentUser, lot });
            this.currentUser.lot = lot;
          }
        } catch (error) {
          this.log.error({
            fileName: 'config.component',
            functionName: 'openUserLotPopup',
            param: error
          });
          this.toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  goToUsers(): void {
    if (!this.isConfig) {
      return;
    }

    this.router.goTo({ path: PATH.USERS });
  }

  goToGarbageHistory() {
    if (!this.isConfig) {
      return;
    }

    this.router.goTo({ path: PATH.GARBAGE_HISTORY });
  }

  onSignOut(): void {
    if (this.loading) {
      return;
    }

    this.popup.open<boolean>(
      {
        component: PopupComponent,
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
}
