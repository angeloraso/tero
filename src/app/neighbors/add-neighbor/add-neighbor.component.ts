import { Component, Inject } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import { BizyRouterService } from '@bizy/core';
import { NeighborsService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
import { NeighborFormComponent } from '@neighbors/components';
@Component({
  selector: 'tero-add-neighbor',
  templateUrl: './add-neighbor.html',
  styleUrls: ['./add-neighbor.css'],
  imports: [...SharedModules, NeighborFormComponent]
})
export class AddNeighborComponent {
  loading: boolean = false;

  constructor(
    @Inject(NeighborsService) private neighbors: NeighborsService,
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(HomeService) private home: HomeService
  ) {
    this.home.hideTabs();
  }

  goBack() {
    this.router.goBack({ path: `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORS}` });
  }

  async save(data: {
    group: number;
    surname: string;
    name: string;
    alarmNumber: number | null;
    alarmControls: Array<number>;
    security: boolean;
    lot: number;
  }) {
    try {
      if (!data || this.loading) {
        return;
      }

      this.loading = true;
      await this.neighbors.postNeighbor(data);
      this.goBack();
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}
