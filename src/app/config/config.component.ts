import { Component, Inject, OnInit } from '@angular/core';
import { BIZY_TAG_TYPE } from '@bizy/components';
import {
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { AboutPopupComponent } from '@config/components';
import { AuthService } from '@core/auth/auth.service';
import { DEFAULT_USER_ID, LOGO_PATH } from '@core/constants';
import { IUserSettings, USER_STATUS } from '@core/model';
import { UserSettingsService } from '@core/services';
import { PopupComponent } from '@shared/components';
import { PATH } from './config.routing';

@Component({
  selector: 'tero-config',
  templateUrl: './config.html',
  styleUrls: ['./config.css']
})
export class ConfigComponent implements OnInit {
  loading = false;

  readonly LOGO_PATH = LOGO_PATH;
  isConfig: boolean = false;
  profilePic: string = '';
  name: string = '';
  email: string = '';
  id: string = DEFAULT_USER_ID;
  status: USER_STATUS | null = null;
  statusTagType: BIZY_TAG_TYPE = BIZY_TAG_TYPE.DEFAULT;
  pendingUsers: Array<IUserSettings> = [];

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(AuthService) private auth: AuthService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(UserSettingsService) private userSettings: UserSettingsService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.profilePic = this.auth.getProfilePicture() ?? '';
      this.name = this.auth.getName() ?? '';
      this.email = this.auth.getEmail() ?? '';
      const [status, id, isConfig] = await Promise.all([
        this.userSettings.getStatus(),
        this.userSettings.getId(),
        this.userSettings.isConfig()
      ]);

      this.id = id ? String(id) : DEFAULT_USER_ID;

      if (status) {
        this.status = status;
        this.statusTagType = this.#getStatusTagType(status);
      }

      this.isConfig = isConfig;

      if (this.isConfig) {
        this.pendingUsers = await this.userSettings.getPendingUsers();
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

  openPopup(): void {
    this.popup.open({ component: AboutPopupComponent });
  }

  goToPendingUsers(): void {
    if (!this.isConfig || this.pendingUsers.length === 0) {
      return;
    }

    this.router.goTo({ path: PATH.PENDING_USERS });
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

  #getStatusTagType(status: USER_STATUS): BIZY_TAG_TYPE {
    switch (status) {
      case USER_STATUS.ACTIVE:
        return BIZY_TAG_TYPE.SUCCESS;
      case USER_STATUS.PENDING:
        return BIZY_TAG_TYPE.INFO;
      case USER_STATUS.SUSPENDED:
        return BIZY_TAG_TYPE.WARNING;
      case USER_STATUS.REJECTED:
        return BIZY_TAG_TYPE.DANGER;
      default:
        return BIZY_TAG_TYPE.DEFAULT;
    }
  }
}
