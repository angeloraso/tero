import { Component, Inject } from '@angular/core';
import { INeighbor } from '@core/model';
import { RouterService } from '@core/services';
import { NeighborhoodService } from '@neighborhood/neighborhood.service';

@Component({
  selector: 'tero-add-neighbor',
  templateUrl: './add-neighbor.html',
  styleUrls: ['./add-neighbor.css']
})
export class AddNeighborComponent {
  constructor(
    @Inject(NeighborhoodService) private neighborhood: NeighborhoodService,
    @Inject(RouterService) private router: RouterService
  ) {
    console.log('test');
  }

  goBack() {
    this.router.goBack();
  }

  async save(neighbor: INeighbor) {
    try {
      if (!neighbor) {
        return;
      }

      this.neighborhood.postNeighbor(neighbor);
    } catch (error) {
      console.error(error);
    }
  }
}
