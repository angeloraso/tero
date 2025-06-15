import { PATH as ACCOUNT_PATH } from '@account/account.routing';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { BIZY_TAG_TYPE, BizyLogService, BizyPopupService, BizyRouterService, BizyToastService } from '@bizy/core';
import { LOTS } from '@core/constants';
import { IUser, USER_ROLE, USER_STATE } from '@core/model';
import { UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
import { UserRolesPopupComponent, UserStatesPopupComponent } from '../components';
@Component({
  selector: 'tero-edit-user',
  templateUrl: './edit-user.html',
  styleUrls: ['./edit-user.css'],
  imports: SharedModules
})
export class EditUserComponent implements OnInit {
  readonly #usersService = inject(UsersService);
  readonly #router = inject(BizyRouterService);
  readonly #fb = inject(FormBuilder);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #home = inject(HomeService);
  readonly #popup = inject(BizyPopupService);

  readonly MIN = 0;
  readonly MAX = LOTS.length;
  readonly MAX_LENGTH = 10;
  readonly USER_STATE = USER_STATE;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;

  user: IUser | null = null;
  userEmail: string | null = null;
  loading = false;
  roleSearch: string | number = '';
  availableRoles: Array<USER_ROLE> = [
    USER_ROLE.CONFIG,
    USER_ROLE.NEIGHBOR,
    USER_ROLE.SECURITY,
    USER_ROLE.SECURITY_GROUP_1,
    USER_ROLE.SECURITY_GROUP_2,
    USER_ROLE.SECURITY_GROUP_3,
    USER_ROLE.SECURITY_GROUP_4,
    USER_ROLE.SECURITY_GROUP_5,
    USER_ROLE.SECURITY_GROUP_6
  ];
  selectedRoles: Array<USER_ROLE> = [];

  form = this.#fb.group({
    name: [null],
    lot: [null, [Validators.min(this.MIN), Validators.max(this.MAX)]],
    phone: [null, [Validators.min(this.MIN), Validators.maxLength(this.MAX_LENGTH)]],
    aliasCBU: [null, []],
    status: [null, [Validators.required]]
  });

  get name() {
    return this.form.get('name') as FormControl;
  }

  get lot() {
    return this.form.get('lot') as FormControl;
  }

  get phone() {
    return this.form.get('phone') as FormControl;
  }

  get aliasCBU() {
    return this.form.get('aliasCBU') as FormControl;
  }

  get status() {
    return this.form.get('status') as FormControl;
  }

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      this.userEmail = this.#router.getId(this.#activatedRoute, 'userEmail');
      if (!this.userEmail) {
        this.goBack();
        return;
      }

      const user = await this.#usersService.getUser(this.userEmail);
      if (!user) {
        this.goBack();
        return;
      }

      this.user = user;
      this.status.setValue(user.status);

      if (user.name) {
        this.name.setValue(user.name);
      }

      if (user.lot) {
        this.lot.setValue(user.lot);
      }

      if (user.phone) {
        this.phone.setValue(user.phone);
      }

      if (user.aliasCBU) {
        this.aliasCBU.setValue(user.aliasCBU);
      }

      if (user.roles) {
        user.roles.forEach(_role => {
          this.addRole(_role);
        });
      }
    } catch (error) {
      this.#log.error({
        fileName: 'edit-user.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  openUserStatesPopup(): void {
    if (this.loading) {
      return;
    }

    this.#popup.open<{ state: USER_STATE }>(
      {
        component: UserStatesPopupComponent,
        fullScreen: true,
        data: { state: this.status.value }
      },
      async res => {
        try {
          if (res) {
            this.status.setValue(res.state);
          }
        } catch (error) {
          this.#log.error({
            fileName: 'edit-user.component',
            functionName: 'openUserStatesPopup',
            param: error
          });
          this.#toast.danger();
        }
      }
    );
  }

  openUserRolesPopup(): void {
    if (this.loading) {
      return;
    }

    this.#popup.open<{ roles: Array<USER_ROLE> }>(
      {
        component: UserRolesPopupComponent,
        fullScreen: true,
        data: { roles: this.selectedRoles }
      },
      async res => {
        try {
          if (res) {
            this.selectedRoles = res.roles;
          }
        } catch (error) {
          this.#log.error({
            fileName: 'edit-user.component',
            functionName: 'openUserRolesPopup',
            param: error
          });
          this.#toast.danger();
        }
      }
    );
  }

  setStatus(state: USER_STATE) {
    if (this.loading || !state) {
      return;
    }

    this.status.setValue(state);
    if (state === USER_STATE.PENDING || state === USER_STATE.REJECTED) {
      this.selectedRoles = [];
      this.availableRoles = [USER_ROLE.CONFIG, USER_ROLE.NEIGHBOR, USER_ROLE.SECURITY];
    }
  }

  addRole(role: USER_ROLE) {
    if (!role) {
      return;
    }

    this.selectedRoles.push(role);

    const index = this.availableRoles.findIndex(_role => _role === role);
    if (index !== -1) {
      this.availableRoles.splice(index, 1);
    }

    this.selectedRoles = [...this.selectedRoles];
    this.availableRoles = [...this.availableRoles];
  }

  removeRole(role: USER_ROLE) {
    if (!role) {
      return;
    }

    this.availableRoles.push(role);

    const index = this.selectedRoles.findIndex(_role => _role === role);
    if (index !== -1) {
      this.selectedRoles.splice(index, 1);
    }

    this.selectedRoles = [...this.selectedRoles];
    this.availableRoles = [...this.availableRoles];
  }

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.ACCOUNT}/${ACCOUNT_PATH.USERS}` });
  }

  async save() {
    try {
      if (this.loading || !this.user || this.form.invalid || (this.selectedRoles.length === 0 && this.status.value === USER_STATE.ACTIVE)) {
        return;
      }

      this.loading = true;
      await this.#usersService.putUser({
        ...this.user,
        name: this.name.value ? String(this.name.value).trim() : null,
        lot: this.lot.value ? Number(this.lot.value) : null,
        phone: this.phone.value ? String(this.phone.value).trim() : null,
        aliasCBU: this.aliasCBU.value ? String(this.aliasCBU.value).trim() : null,
        roles: this.selectedRoles,
        status: this.status.value,
        topicSubscriptions: this.user.topicSubscriptions
      });
      this.goBack();
    } catch (error) {
      this.#log.error({
        fileName: 'edit-user.component',
        functionName: 'save',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
