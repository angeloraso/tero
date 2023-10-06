import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { AfterViewInit, Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PATH as APP_PATH } from '@app/app.routing';
import { ConfirmAlertComponent } from '@components/confirm-alert';
import { INeighbor } from '@core/model';
import { RouterService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { PATH as MENU_PATH } from '@menu/side-menu.routing';
import { Subscription } from 'rxjs';
import { PATH as NEIGHBORHOOD_PATH } from './neighborhood.routing';
import { NeighborhoodService } from './neighborhood.service';

@Component({
  selector: 'tero-neighborhood',
  templateUrl: './neighborhood.html',
  styleUrls: ['./neighborhood.css']
})
export class NeighborhoodComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort | null = null;
  readonly DISPLAYED_COLUMNS = ['lot', 'surname', 'name', 'actions'];
  dataSource = new MatTableDataSource<INeighbor>();

  private _subscription = new Subscription();

  constructor(
    @Inject(MatDialog) private dialog: MatDialog,
    @Inject(NeighborhoodService) private neighborhood: NeighborhoodService,
    @Inject(RouterService) private router: RouterService
  ) {}

  async ngAfterViewInit() {
    try {
      const data = await this.neighborhood.getNeighbors();
      if (this.sort) {
        this.dataSource.sort = this.sort;
        this.dataSource.sort.active = 'lot';
        this.dataSource.sort.direction = 'desc';
      }
      this.dataSource.data = data;
    } catch (error) {
      console.log(error);
    }
  }

  addNeighbor() {
    this.router.goTo({
      path: `/${APP_PATH.MENU}/${MENU_PATH.HOME}/${HOME_PATH.NEIGHBORHOOD}/${NEIGHBORHOOD_PATH.ADD}`
    });
  }

  editNeighbor(neighbor: INeighbor) {
    this.router.goTo({
      path: `/${APP_PATH.MENU}/${MENU_PATH.HOME}/${HOME_PATH.NEIGHBORHOOD}/${neighbor.id}`
    });
  }

  openAlertDialog(neighbor: INeighbor) {
    const dialogRef = this.dialog.open(ConfirmAlertComponent, {
      data: neighbor,
      scrollStrategy: new NoopScrollStrategy(),
      panelClass: 'tero-material-dialog'
    });

    this._subscription.add(
      dialogRef.afterClosed().subscribe((res: boolean) => {
        if (res) {
          this._deleteNeighbor(neighbor);
        }
      })
    );
  }

  private async _deleteNeighbor(neighbor: INeighbor) {
    try {
      await this.neighborhood.deleteNeighbor(neighbor);
      const index = this.dataSource.data.findIndex(_neighbor => _neighbor.id === neighbor.id);
      if (index !== -1) {
        this.dataSource.data.splice(index, 1);
        this.dataSource.data = [...this.dataSource.data];
      }
    } catch (error) {
      console.log(error);
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
