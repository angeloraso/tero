import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { PATH as APP_PATH } from '@app/app.routing';
import { HomeService } from '@app/home/home.service';
import { SharedModules } from '@app/shared';
import {
  BIZY_TAG_TYPE,
  BizyFormComponent,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyValidatorService
} from '@bizy/core';
import { UsersPopupComponent } from '@components/users-popup';
import { DEFAULT_USER_PICTURE, EMAIL_MAX_LENGTH, EMAIL_MIN_LENGTH, IMG_PATH, LOTS, NAME_MAX_LENGTH, NAME_MIN_LENGTH } from '@core/constants';
import { IUser } from '@core/model';
import { NeighborsService, UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { AlarmControlsPopupComponent, AlarmPopupComponent, SecurityGroupPopupComponent } from '@neighbors/components';
@Component({
  selector: 'tero-add-neighbor',
  templateUrl: './add-neighbor.html',
  styleUrls: ['./add-neighbor.css'],
  imports: SharedModules
})
export class AddNeighborComponent implements OnInit {
  @ViewChild(BizyFormComponent) formComponent: BizyFormComponent | null = null;
  readonly #neighborsService = inject(NeighborsService);
  readonly #usersService = inject(UsersService);
  readonly #home = inject(HomeService);
  readonly #router = inject(BizyRouterService);
  readonly #fb = inject(FormBuilder);
  readonly #popup = inject(BizyPopupService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #validator = inject(BizyValidatorService);

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly MIN_LOT_VALUE = 0;
  readonly MAX_LOT_VALUE = LOTS.length;
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly EMAIL_MIN_LENGTH = EMAIL_MIN_LENGTH;
  readonly EMAIL_MAX_LENGTH = EMAIL_MAX_LENGTH;
  readonly IMG_PATH = IMG_PATH;
  readonly DEFAULT_USER_PICTURE = DEFAULT_USER_PICTURE;

  readonly #form = this.#fb.group({
    name: [null, [Validators.minLength(this.NAME_MIN_LENGTH), Validators.maxLength(this.NAME_MAX_LENGTH), Validators.required]],
    surname: [null],
    lot: [null, [Validators.min(this.MIN_LOT_VALUE), Validators.max(this.MAX_LOT_VALUE), Validators.required]],
    alarmNumber: [null],
    alarmControls: [[]],
    group: [null],
    email: [null, [Validators.minLength(this.EMAIL_MIN_LENGTH), Validators.maxLength(this.EMAIL_MAX_LENGTH), this.#validator.emailValidator()]]
  });

  loading: boolean = false;
  currentUser: IUser | null = null;

  get name() {
    return this.#form.get('name') as FormControl;
  }

  get surname() {
    return this.#form.get('surname') as FormControl;
  }

  get lot() {
    return this.#form.get('lot') as FormControl;
  }

  get group() {
    return this.#form.get('group') as FormControl;
  }

  get email() {
    return this.#form.get('email') as FormControl;
  }

  get alarmNumber() {
    return this.#form.get('alarmNumber') as FormControl;
  }

  get alarmControls() {
    return this.#form.get('alarmControls') as FormControl;
  }

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.hideTabs();
      const currentUser = await this.#usersService.getCurrentUser();

      this.currentUser = currentUser;
    } catch (error) {
      this.#log.error({
        fileName: 'add-neighbor.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  openSecurityGroupsPopup() {
    if (this.loading) {
      return;
    }

    this.#popup.open<{ group: number | null }>(
      {
        component: SecurityGroupPopupComponent,
        fullScreen: true,
        data: { group: this.group.value }
      },
      async res => {
        try {
          if (res) {
            this.group.setValue(res.group);
          }
        } catch (error) {
          this.#log.error({
            fileName: 'add-neighbor.component',
            functionName: 'openSecurityGroupsPopup',
            param: error
          });
          this.#toast.danger();
        }
      }
    );
  }

  openAlarmPopup() {
    if (this.loading) {
      return;
    }

    this.#popup.open<{ alarmNumber: number | null }>(
      {
        component: AlarmPopupComponent,
        fullScreen: true,
        data: { alarm: this.alarmNumber.value }
      },
      async res => {
        try {
          if (res) {
            this.alarmNumber.setValue(res.alarmNumber);
          }
        } catch (error) {
          this.#log.error({
            fileName: 'add-neighbor.component',
            functionName: 'openAlarmPopup',
            param: error
          });
          this.#toast.danger();
        }
      }
    );
  }

  openAlarmControlsPopup() {
    if (this.loading) {
      return;
    }

    this.#popup.open<{ alarmControls: Array<number> }>(
      {
        component: AlarmControlsPopupComponent,
        fullScreen: true,
        data: { alarmControls: this.alarmControls.value }
      },
      async res => {
        try {
          if (res) {
            this.alarmControls.setValue(res.alarmControls);
          }
        } catch (error) {
          this.#log.error({
            fileName: 'add-neighbor.component',
            functionName: 'openAlarmControlPopup',
            param: error
          });
          this.#toast.danger();
        }
      }
    );
  }

  openUsersPopup() {
    if (this.loading) {
      return;
    }

    this.#popup.open<{ users: Array<{ name: string; email: string }> }>(
      {
        component: UsersPopupComponent,
        fullScreen: true,
        data: {
          emails: this.email.value ? [this.email.value] : [],
          maxLimit: 1,
          currentUser: this.currentUser
        }
      },
      async res => {
        try {
          if (res && res.users) {
            if (res.users.length > 0) {
              this.email.setValue(res.users[0].email);
            } else {
              this.email.setValue(null);
            }
          }
        } catch (error) {
          this.#log.error({
            fileName: 'add-neighbor.component',
            functionName: 'openUsersPopup',
            param: error
          });
          this.#toast.danger();
        }
      }
    );
  }

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORS}` });
  }

  async save() {
    try {
      if (this.#form.invalid || this.loading) {
        this.formComponent?.setTouched();
        return;
      }

      this.loading = true;
      await this.#neighborsService.postNeighbor({
        name: this.name.value ? this.name.value.trim() : '',
        surname: this.surname.value ? this.surname.value.trim() : '',
        email: this.email.value || null,
        lot: Number(this.lot.value),
        alarmNumber: this.alarmNumber.value,
        alarmControls: this.alarmControls.value,
        security: this.group.value,
        group: this.group.value
      });
      this.goBack();
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}
