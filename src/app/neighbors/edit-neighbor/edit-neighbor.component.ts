import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { Empty, INeighbor } from '@core/model';
import { NeighborsService } from '@core/services';
import { PopupComponent } from '@shared/components';

@Component({
  selector: 'tero-edit-neighbor',
  templateUrl: './edit-neighbor.html',
  styleUrls: ['./edit-neighbor.css']
})
export class EditNeighborComponent implements OnInit {
  neighbor: INeighbor | Empty;
  neighborId: string | Empty;
  loading = false;

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(NeighborsService) private neighborsService: NeighborsService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(ActivatedRoute) private activatedRoute: ActivatedRoute,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
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
    this.router.goBack();
  }

  async save(neighbor: INeighbor) {
    try {
      if (!neighbor) {
        return;
      }

      this.loading = true;
      await this.neighborsService.putNeighbor(neighbor);
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
