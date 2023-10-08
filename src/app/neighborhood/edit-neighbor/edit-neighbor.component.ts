import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConfirmAlertComponent } from '@components/confirm-alert';
import { Empty, INeighbor } from '@core/model';
import { RouterService } from '@core/services';
import { HomeService } from '@home/home.service';
import { NeighborhoodService } from '@neighborhood/neighborhood.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tero-edit-neighbor',
  templateUrl: './edit-neighbor.html',
  styleUrls: ['./edit-neighbor.css']
})
export class EditNeighborComponent implements OnInit, OnDestroy {
  neighbor: INeighbor | Empty;
  neighborId: string | Empty;
  showLoading = false;

  #subscription = new Subscription();

  constructor(
    @Inject(MatDialog) private dialog: MatDialog,
    @Inject(NeighborhoodService) private neighborhood: NeighborhoodService,
    @Inject(RouterService) private router: RouterService,
    @Inject(ActivatedRoute) private activatedRoute: ActivatedRoute,
    @Inject(HomeService) private home: HomeService
  ) {
    this.home.updateTitle('NEIGHBORHOOD.ADD_NEIGHBOR.TITLE');
  }

  async ngOnInit() {
    try {
      this.showLoading = true;
      this.neighborId = this.router.getId(this.activatedRoute, 'neighborId');
      if (!this.neighborId) {
        this.goBack();
        return;
      }

      this.neighbor = await this.neighborhood.getNeighbor(this.neighborId);
    } catch (error) {
      console.error(error);
    } finally {
      this.showLoading = false;
      this.home.setDeleteFn(this.openAlertDialog);
    }
  }

  openAlertDialog = () => {
    if (!this.neighbor) {
      return;
    }

    const dialogRef = this.dialog.open(ConfirmAlertComponent, {
      data: this.neighbor,
      scrollStrategy: new NoopScrollStrategy(),
      panelClass: 'tero-material-dialog'
    });

    this.#subscription.add(
      dialogRef.afterClosed().subscribe((res: boolean) => {
        if (res) {
          this._deleteNeighbor(this.neighbor!);
        }
      })
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

      await this.neighborhood.putNeighbor(neighbor);
      this.goBack();
    } catch (error) {
      console.error(error);
    }
  }

  private async _deleteNeighbor(neighbor: INeighbor) {
    try {
      await this.neighborhood.deleteNeighbor(neighbor);
      this.goBack();
    } catch (error) {
      console.log(error);
    }
  }

  ngOnDestroy() {
    this.#subscription.unsubscribe();
    this.home.setDeleteFn(null);
  }
}
