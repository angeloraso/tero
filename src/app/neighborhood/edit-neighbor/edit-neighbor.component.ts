import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Empty, INeighbor } from '@core/model';
import { RouterService } from '@core/services';
import { HomeService } from '@home/home.service';
import { NeighborhoodService } from '@neighborhood/neighborhood.service';

@Component({
  selector: 'tero-edit-neighbor',
  templateUrl: './edit-neighbor.html',
  styleUrls: ['./edit-neighbor.css']
})
export class EditNeighborComponent implements OnInit {
  neighbor: INeighbor | Empty;
  neighborId: string | Empty;

  constructor(
    @Inject(NeighborhoodService) private neighborhood: NeighborhoodService,
    @Inject(RouterService) private router: RouterService,
    @Inject(ActivatedRoute) private activatedRoute: ActivatedRoute,
    @Inject(HomeService) private home: HomeService
  ) {
    this.home.updateTitle('NEIGHBORHOOD.ADD_NEIGHBOR.TITLE');
  }

  async ngOnInit() {
    try {
      this.neighborId = this.router.getId(this.activatedRoute, 'neighborId');
      if (!this.neighborId) {
        this.goBack();
        return;
      }

      this.neighbor = await this.neighborhood.getNeighbor(this.neighborId);
    } catch (error) {
      console.error(error);
    }
  }

  goBack() {
    this.router.goBack();
  }

  async save(neighbor: INeighbor) {
    try {
      if (!neighbor) {
        return;
      }

      await this.neighborhood.putNeighbor(neighbor);
      this.goBack();
    } catch (error) {
      console.error(error);
    }
  }
}
