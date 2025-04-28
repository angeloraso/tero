import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { HomeService } from '@app/home/home.service';
import { SharedModules } from '@app/shared';
import {
  BIZY_TAG_TYPE,
  BizyDeviceService,
  BizyFormComponent,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { DEFAULT_USER_PICTURE, LOTS, NAME_MAX_LENGTH, NAME_MIN_LENGTH, NO_ID } from '@core/constants';
import { INeighbor } from '@core/model';
import { NeighborsService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { AlarmControlsPopupComponent, AlarmPopupComponent, SecurityGroupPopupComponent } from '@neighbors/components';
@Component({
  selector: 'tero-edit-neighbor',
  templateUrl: './edit-neighbor.html',
  styleUrls: ['./edit-neighbor.css'],
  imports: SharedModules
})
export class EditNeighborComponent implements OnInit {
  @ViewChild(BizyFormComponent) formComponent: BizyFormComponent | null = null;
  readonly #neighborsService = inject(NeighborsService);
  readonly #home = inject(HomeService);
  readonly #router = inject(BizyRouterService);
  readonly #activatedRoute = inject(ActivatedRoute);
  readonly #device = inject(BizyDeviceService);
  readonly #fb = inject(FormBuilder);
  readonly #popup = inject(BizyPopupService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #translate = inject(BizyTranslateService);

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly MIN_VALUE = 0;
  readonly MAX_LOT_VALUE = LOTS.length;
  readonly NAME_MIN_LENGTH = NAME_MIN_LENGTH;
  readonly NAME_MAX_LENGTH = NAME_MAX_LENGTH;
  readonly DEFAULT_USER_PICTURE = DEFAULT_USER_PICTURE;

  readonly #form = this.#fb.group({
    name: [null, [Validators.required]],
    surname: [null],
    lot: [null, [Validators.min(this.MIN_VALUE), Validators.max(this.MAX_LOT_VALUE), Validators.required]],
    alarmNumber: [NO_ID],
    alarmControls: [[]],
    group: [NO_ID]
  });

  readonly NO_ID = NO_ID;
  neighbor: INeighbor | null = null;
  loading: boolean = false;
  isDesktop = this.#device.isDesktop();

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
      const neighborId = this.#router.getId(this.#activatedRoute, 'neighborId');
      if (!neighborId) {
        this.goBack();
        return;
      }

      this.neighbor = await this.#neighborsService.getNeighbor(neighborId);
      if (this.neighbor.name) {
        this.name.setValue(this.neighbor.name);
      }

      if (this.neighbor.surname) {
        this.surname.setValue(this.neighbor.surname);
      }

      if (this.neighbor.lot) {
        this.lot.setValue(this.neighbor.lot);
      }

      if (this.neighbor.group) {
        this.group.setValue(this.neighbor.group);
      }

      if (this.neighbor.alarmNumber) {
        this.alarmNumber.setValue(this.neighbor.alarmNumber);
      }

      if (this.neighbor.alarmControls) {
        this.alarmControls.setValue(this.neighbor.alarmControls);
      }
    } catch (error) {
      this.#log.error({
        fileName: 'edit-neighbor.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  deleteNeighbor = () => {
    if (!this.neighbor || this.loading) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('NEIGHBORS.EDIT_NEIGHBOR.DELETE_POPUP.TITLE'),
          msg: `${this.#translate.get('NEIGHBORS.EDIT_NEIGHBOR.DELETE_POPUP.MSG')}: ${this.neighbor.surname} ${this.neighbor.name}`
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            await this.#neighborsService.deleteNeighbor(this.neighbor as INeighbor);
            this.goBack();
          }
        } catch (error) {
          this.#log.error({
            fileName: 'edit-neighbor.component',
            functionName: 'deleteNeighbor',
            param: error
          });
          this.#toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  };

  openSecurityGroupsPopup() {
    if (this.loading || this.isDesktop) {
      return;
    }

    this.#popup.open<number | null>(
      {
        component: SecurityGroupPopupComponent,
        fullScreen: true,
        data: { group: this.group.value }
      },
      async group => {
        try {
          if (group) {
            this.group.setValue(group);
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
    if (this.loading || this.isDesktop) {
      return;
    }

    this.#popup.open<number | null>(
      {
        component: AlarmPopupComponent,
        fullScreen: true,
        data: { alarm: this.alarmNumber.value }
      },
      async alarm => {
        try {
          if (alarm) {
            this.alarmNumber.setValue(alarm);
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
    if (this.loading || this.isDesktop) {
      return;
    }

    this.#popup.open<Array<number>>(
      {
        component: AlarmControlsPopupComponent,
        fullScreen: true,
        data: { controls: this.alarmControls.value }
      },
      async controls => {
        try {
          if (controls) {
            this.alarmControls.setValue(controls);
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

  goBack() {
    this.#router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORS}` });
  }

  async save() {
    try {
      if (this.#form.invalid || this.loading || !this.neighbor) {
        this.formComponent?.setTouched();
        return;
      }

      this.loading = true;
      await this.#neighborsService.putNeighbor({
        ...this.neighbor,
        name: this.name.value ? this.name.value.trim() : '',
        surname: this.surname.value ? this.surname.value.trim() : '',
        lot: Number(this.lot.value),
        alarmNumber: this.alarmNumber.value,
        alarmControls: this.alarmControls.value,
        security: Boolean(this.group.value),
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
