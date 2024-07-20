import { Component, Inject, OnInit } from '@angular/core';
import { BIZY_TAG_TYPE } from '@bizy/components';
import {
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { LOGO_PATH } from '@core/constants';
import { MobileService, UserSettingsService } from '@core/services';
import { PopupComponent } from '@shared/components';
import { IUserSettings } from './../../core/model';

interface IUserSettingsCard extends IUserSettings {
  email: string;
}

@Component({
  selector: 'tero-pending-users',
  templateUrl: './pending-users.html',
  styleUrls: ['./pending-users.css']
})
export class PendingUsersComponent implements OnInit {
  loading = false;
  isConfig = false;
  pendingUsers: Array<IUserSettingsCard> = [];
  search: string | number = '';
  searchKeys = 'email';
  order: 'asc' | 'desc' | null = 'asc';
  orderBy = 'email';
  isMobile = true;

  readonly LOGO_PATH = LOGO_PATH;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;

  constructor(
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(MobileService) private mobile: MobileService,
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService,
    @Inject(UserSettingsService) private userSettingsService: UserSettingsService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService
  ) {
    this.isMobile = this.mobile.isMobile();
  }

  async ngOnInit() {
    try {
      this.loading = true;
      const [pendingUsers, isConfig] = await Promise.all([
        this.userSettingsService.getPendingUsers(),
        this.userSettingsService.isConfig()
      ]);

      if (!isConfig) {
        this.router.goBack();
        return;
      }

      this.isConfig = isConfig;

      this.pendingUsers = pendingUsers ?? [];
    } catch (error) {
      this.log.error({
        fileName: 'pending-users.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }

  async onReject(email: string) {
    if (!email || !this.isConfig) {
      return;
    }

    this.popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.translate.get('CONFIG.PENDING_USERS.REJECT_POPUP.TITLE'),
          msg: this.translate.get('CONFIG.PENDING_USERS.REJECT_POPUP.MSG')
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            await this.userSettingsService.rejectPendingUser(email);
            const index = this.pendingUsers.findIndex(_pendingUser => _pendingUser.email === email);
            if (index !== -1) {
              this.pendingUsers.splice(index, 1);
              this.pendingUsers = [...this.pendingUsers];
            }
          }
        } catch (error) {
          this.log.error({
            fileName: 'pending-users.component',
            functionName: 'onReject',
            param: error
          });
          this.toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  async onAccept(email: string) {
    if (!email || !this.isConfig) {
      return;
    }

    this.popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.translate.get('CONFIG.PENDING_USERS.ACCEPT_POPUP.TITLE'),
          msg: this.translate.get('CONFIG.PENDING_USERS.ACCEPT_POPUP.MSG')
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            await this.userSettingsService.acceptPendingUser(email);
            const index = this.pendingUsers.findIndex(_pendingUser => _pendingUser.email === email);
            if (index !== -1) {
              this.pendingUsers.splice(index, 1);
              this.pendingUsers = [...this.pendingUsers];
            }
          }
        } catch (error) {
          this.log.error({
            fileName: 'pending-users.component',
            functionName: 'onAccept',
            param: error
          });
          this.toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  }

  goBack() {
    this.router.goBack();
  }
}
