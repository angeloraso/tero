import { Component, Inject } from '@angular/core';
import { BizyRouterService } from '@bizy/services';
import { LOGO_PATH } from '@core/constants';
import { INeighbor } from '@core/model';
import { NeighborsService } from '@core/services';

@Component({
  selector: 'tero-add-neighbor',
  templateUrl: './add-neighbor.html',
  styleUrls: ['./add-neighbor.css']
})
export class AddNeighborComponent {
  loading: boolean = false;
  readonly LOGO_PATH = LOGO_PATH;

  constructor(
    @Inject(NeighborsService) private neighbors: NeighborsService,
    @Inject(BizyRouterService) private router: BizyRouterService
  ) {}

  goBack() {
    this.router.goBack();
  }

  async save(neighbor: INeighbor) {
    try {
      if (!neighbor || this.loading) {
        return;
      }

      this.loading = true;
      await this.neighbors.postNeighbor(neighbor);
      this.goBack();
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
    }
  }
}
