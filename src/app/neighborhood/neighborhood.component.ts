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
import { HomeService } from '@home/home.service';
import { PATH as MENU_PATH } from '@menu/side-menu.routing';
import { Subscription } from 'rxjs';
import { PATH as NEIGHBORHOOD_PATH } from './neighborhood.routing';
import { NeighborhoodService } from './neighborhood.service';

interface INeighborRow extends INeighbor {
  group?: number;
}

@Component({
  selector: 'tero-neighborhood',
  templateUrl: './neighborhood.html',
  styleUrls: ['./neighborhood.css']
})
export class NeighborhoodComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort | null = null;
  readonly DISPLAYED_COLUMNS = ['group', 'lot', 'surname', 'name', 'security', 'actions'];
  dataSource = new MatTableDataSource<INeighborRow>();

  private _subscription = new Subscription();

  constructor(
    @Inject(MatDialog) private dialog: MatDialog,
    @Inject(NeighborhoodService) private neighborhood: NeighborhoodService,
    @Inject(RouterService) private router: RouterService,
    @Inject(HomeService) private home: HomeService
  ) {
    this.home.updateTitle('NEIGHBORHOOD.TITLE');
  }

  async ngAfterViewInit() {
    try {
      const neighborhood = await this.neighborhood.getNeighbors();
      if (this.sort) {
        this.dataSource.sort = this.sort;
        this.dataSource.sort.active = 'lot';
        this.dataSource.sort.direction = 'asc';
      }
      this.dataSource.data = neighborhood.map(_neighbor => {
        return { ..._neighbor, group: this._getGroup(_neighbor) };
      });
    } catch (error) {
      console.log(error);
    }
  }

  addNeighbor() {
    this.router.goTo({
      path: `/${APP_PATH.MENU}/${MENU_PATH.HOME}/${HOME_PATH.NEIGHBORHOOD}/${NEIGHBORHOOD_PATH.ADD}`
    });
  }

  editNeighbor(neighbor: INeighborRow) {
    this.router.goTo({
      path: `/${APP_PATH.MENU}/${MENU_PATH.HOME}/${HOME_PATH.NEIGHBORHOOD}/${neighbor.id}`
    });
  }

  openAlertDialog(neighbor: INeighborRow) {
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

  private async _deleteNeighbor(neighbor: INeighborRow) {
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

  private _getGroup(neighbor: INeighbor): number {
    if (!neighbor || !neighbor.lot) {
      return 0;
    }

    if (neighbor.lot > 0 && neighbor.lot <= 33) {
      return 1;
    } else if (neighbor.lot > 33 && neighbor.lot <= 71) {
      return 2;
    } else if (neighbor.lot > 71 && neighbor.lot <= 103) {
      return 3;
    } else if (neighbor.lot > 103 && neighbor.lot <= 145) {
      return 4;
    } else if (neighbor.lot > 145 && neighbor.lot <= 175) {
      return 5;
    } else if (neighbor.lot > 175 && neighbor.lot <= 215) {
      return 6;
    } else {
      return 0;
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
