import { Component, Inject, OnDestroy } from '@angular/core';
import { INeighbor } from '@core/model';
import { NeighborhoodService, RouterService } from '@core/services';
import { HomeService } from '@home/home.service';

@Component({
  selector: 'tero-add-neighbor',
  templateUrl: './add-neighbor.html',
  styleUrls: ['./add-neighbor.css']
})
export class AddNeighborComponent implements OnDestroy {
  showLoading = false;

  constructor(
    @Inject(NeighborhoodService) private neighborhood: NeighborhoodService,
    @Inject(RouterService) private router: RouterService,
    @Inject(HomeService) private home: HomeService
  ) {
    this.home.updateTitle('NEIGHBORHOOD.ADD_NEIGHBOR.TITLE');
    this.home.hideBottomBar(true);
  }

  goBack() {
    this.router.goBack();
  }

  async save(neighbor: INeighbor) {
    try {
      if (!neighbor) {
        return;
      }

      this.showLoading = true;
      await this.neighborhood.postNeighbor(neighbor);
      this.goBack();
    } catch (error) {
      console.error(error);
    } finally {
      this.showLoading = false;
    }
  }

  ngOnDestroy(): void {
    this.home.hideBottomBar(false);
  }
}
