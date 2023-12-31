import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { ConfirmAlertComponent } from '@components/confirm-alert';
import { Empty, INeighbor } from '@core/model';
import { NeighborhoodService, RouterService } from '@core/services';
import { HomeService } from '@home/home.service';
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
    this.home.updateTitle('NEIGHBORHOOD.EDIT_NEIGHBOR.TITLE');
    this.home.hideBottomBar(true);
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

      this.showLoading = true;
      this.home.setDeleteFn(null);
      await this.neighborhood.putNeighbor(neighbor);
      this.goBack();
    } catch (error) {
      this.home.setDeleteFn(this.openAlertDialog);
      console.error(error);
    } finally {
      this.showLoading = false;
    }
  }

  private async _deleteNeighbor(neighbor: INeighbor) {
    try {
      this.showLoading = true;
      this.home.setDeleteFn(null);
      await this.neighborhood.deleteNeighbor(neighbor);
      this.goBack();
    } catch (error) {
      this.home.setDeleteFn(this.openAlertDialog);
      console.log(error);
    } finally {
      this.showLoading = false;
    }
  }

  ngOnDestroy() {
    this.#subscription.unsubscribe();
    this.home.setDeleteFn(null);
    this.home.hideBottomBar(false);
  }
}
