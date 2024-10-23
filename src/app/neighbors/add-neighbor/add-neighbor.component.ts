import { Component, Inject } from '@angular/core';
import { BizyRouterService } from '@bizy/services';
import { NeighborsService } from '@core/services';

@Component({
  selector: 'tero-add-neighbor',
  templateUrl: './add-neighbor.html',
  styleUrls: ['./add-neighbor.css']
})
export class AddNeighborComponent {
  loading: boolean = false;

  constructor(
    @Inject(NeighborsService) private neighbors: NeighborsService,
    @Inject(BizyRouterService) private router: BizyRouterService
  ) {}

  goBack() {
    this.router.goBack();
  }

  async save(data: {
    group: number;
    surname: string;
    name: string;
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
