import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import {
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { INeighbor } from '@core/model';
import { NeighborsService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
import { NeighborFormComponent } from '@neighbors/components';

@Component({
    selector: 'tero-edit-neighbor',
    templateUrl: './edit-neighbor.html',
    styleUrls: ['./edit-neighbor.css'],
    imports: [...SharedModules, NeighborFormComponent]
})
export class EditNeighborComponent implements OnInit {
  neighbor: INeighbor | null = null;
  neighborId: string | null = null;
  loading = false;

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(NeighborsService) private neighborsService: NeighborsService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(ActivatedRoute) private activatedRoute: ActivatedRoute,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService,
    @Inject(HomeService) private home: HomeService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      this.home.hideTabs();
      this.neighborId = this.router.getId(this.activatedRoute, 'neighborId');
      if (!this.neighborId) {
        this.goBack();
        return;
      }

      this.neighbor = await this.neighborsService.getNeighbor(this.neighborId);
    } catch (error) {
      this.log.error({
        fileName: 'edit-neighbor.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }

  deleteNeighbor = () => {
    if (!this.neighbor || this.loading) {
      return;
    }

    this.popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.translate.get('NEIGHBORS.EDIT_NEIGHBOR.DELETE_POPUP.TITLE'),
          msg: `${this.translate.get('NEIGHBORS.EDIT_NEIGHBOR.DELETE_POPUP.MSG')}: ${this.neighbor.surname} ${this.neighbor.name}`
        }
      },
      async res => {
        try {
          if (res) {
            this.loading = true;
            await this.neighborsService.deleteNeighbor(this.neighbor as INeighbor);
            this.goBack();
          }
        } catch (error) {
          this.log.error({
            fileName: 'edit-neighbor.component',
            functionName: 'deleteNeighbor',
            param: error
          });
          this.toast.danger();
        } finally {
          this.loading = false;
        }
      }
    );
  };

  goBack() {
    this.router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORS}` });
  }

  async save(data: {
    group: number;
    surname: string;
    alarmNumber: number | null;
    alarmControls: Array<number>;
    name: string;
    security: boolean;
    lot: number;
  }) {
    try {
      if (!data || this.loading || !this.neighbor) {
        return;
      }

      this.loading = true;
      await this.neighborsService.putNeighbor({
        ...this.neighbor,
        group: data.group,
        surname: data.surname,
        name: data.name,
        alarmNumber: data.alarmNumber,
        alarmControls: data.alarmControls,
        security: data.security,
        lot: data.lot
      });
      this.goBack();
    } catch (error) {
      this.log.error({
        fileName: 'edit-neighbor.component',
        functionName: 'save',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
