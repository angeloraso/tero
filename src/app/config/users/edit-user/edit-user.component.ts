import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { BIZY_TAG_TYPE, BizyLogService, BizyRouterService, BizyToastService } from '@bizy/core';
import { PATH as CONFIG_PATH } from '@config/config.routing';
import { LOTS } from '@core/constants';
import { IUser, USER_ROLE, USER_STATE } from '@core/model';
import { UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
@Component({
    selector: 'tero-edit-user',
    templateUrl: './edit-user.html',
    styleUrls: ['./edit-user.css'],
    imports: SharedModules
})
export class EditUserComponent implements OnInit {
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

  form: FormGroup<{
    name: FormControl<any>;
    lot: FormControl<any>;
    phone: FormControl<any>;
    aliasCBU: FormControl<any>;
    status: FormControl<any>;
  }>;

  readonly MIN = 0;
  readonly MAX = LOTS.length;
  readonly MAX_LENGTH = 10;
  readonly USER_STATE = USER_STATE;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly USER_STATES: Array<USER_STATE> = [
    USER_STATE.ACTIVE,
    USER_STATE.PENDING,
    USER_STATE.REJECTED,
    USER_STATE.SUSPENDED
  ];

  constructor(
    @Inject(UsersService) private usersService: UsersService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(FormBuilder) private fb: FormBuilder,
    @Inject(ActivatedRoute) private activatedRoute: ActivatedRoute,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(HomeService) private home: HomeService
  ) {
    this.form = this.fb.group({
      name: [''],
      lot: [null, [Validators.min(this.MIN), Validators.max(this.MAX)]],
      phone: [null, [Validators.min(this.MIN), Validators.maxLength(this.MAX_LENGTH)]],
      aliasCBU: [null, []],
      status: [null, [Validators.required]]
    });
  }

  get name() {
    return this.form.get('name') as FormControl<string | number>;
  }

  get lot() {
    return this.form.get('lot') as FormControl<string | number>;
  }

  get phone() {
    return this.form.get('phone') as FormControl<string | number>;
  }

  get aliasCBU() {
    return this.form.get('aliasCBU') as FormControl<string | number>;
  }

  get status() {
    return this.form.get('status') as FormControl<USER_STATE>;
  }

  async ngOnInit() {
    try {
      this.loading = true;
      this.home.hideTabs();
      this.userEmail = this.router.getId(this.activatedRoute, 'userEmail');
      if (!this.userEmail) {
        this.goBack();
        return;
      }

      const user = await this.usersService.getUser(this.userEmail);
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
      this.log.error({
        fileName: 'edit-user.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
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
    this.router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.CONFIG}/${CONFIG_PATH.USERS}` });
  }

  async save() {
    try {
      if (
        this.loading ||
        !this.user ||
        this.form.invalid ||
        (this.selectedRoles.length === 0 && this.status.value === USER_STATE.ACTIVE)
      ) {
        return;
      }

      this.loading = true;
      await this.usersService.putUser({
        ...this.user,
        name: this.name.value ? String(this.name.value) : null,
        lot: this.lot.value ? Number(this.lot.value) : null,
        phone: this.phone.value ? String(this.phone.value) : null,
        aliasCBU: this.aliasCBU.value ? String(this.aliasCBU.value) : null,
        roles: this.selectedRoles,
        status: this.status.value
      });
      this.goBack();
    } catch (error) {
      this.log.error({
        fileName: 'edit-user.component',
        functionName: 'save',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
