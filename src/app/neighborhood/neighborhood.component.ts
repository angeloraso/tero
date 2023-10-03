import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { AfterViewInit, Component, Inject, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ConfirmAlertComponent } from '@components/confirm-alert';
import { INeighbor } from '@core/model';
import { NeighborhoodService } from '@neighborhood/neighborhood.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tero-neighborhood',
  templateUrl: './neighborhood.html',
  styleUrls: ['./neighborhood.css']
})
export class NeighborhoodComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort: MatSort | null = null;
  readonly DISPLAYED_COLUMNS = ['date', 'amount', 'balance', 'actions'];
  dataSource = new MatTableDataSource<INeighbor>();

  private _subscription = new Subscription();

  constructor(
    @Inject(MatDialog) private dialog: MatDialog,
    @Inject(NeighborhoodService) private neighborhood: NeighborhoodService
  ) {}

  async ngAfterViewInit() {
    try {
      const data = await this.neighborhood.getNeighbors();
      if (this.sort) {
        this.dataSource.sort = this.sort;
        this.dataSource.sort.active = 'date';
        this.dataSource.sort.direction = 'desc';
      }
      this.dataSource.data = data;
    } catch (error) {
      console.log(error);
    }
  }

  goToNeighbor(neighbor: INeighbor) {
    console.log(neighbor);
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
