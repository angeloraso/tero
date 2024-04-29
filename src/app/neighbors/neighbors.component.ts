import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { PATH as APP_PATH } from '@app/app.routing';
import { INeighbor } from '@core/model';
import { NeighborhoodService, RouterService, UtilsService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { HomeService } from '@home/home.service';
import { PATH as MENU_PATH } from '@menu/side-menu.routing';
import { PATH as NEIGHBORHOOD_PATH } from './neighbors.routing';

interface INeighborRow extends INeighbor {
  group?: number;
}

@Component({
  selector: 'tero-neighbors',
  templateUrl: './neighbors.html',
  styleUrls: ['./neighbors.css']
})
export class NeighborsComponent implements OnInit {
  @ViewChild(MatSort) sort: MatSort | null = null;
  readonly DISPLAYED_COLUMNS = ['group', 'lot', 'surname', 'name', 'security'];
  dataSource = new MatTableDataSource<INeighborRow>();
  showLoading: boolean = false;

  constructor(
    @Inject(NeighborhoodService) private neighborhood: NeighborhoodService,
    @Inject(RouterService) private router: RouterService,
    @Inject(HomeService) private home: HomeService,
    @Inject(UtilsService) private utils: UtilsService
  ) {
    this.home.updateTitle('NEIGHBORHOOD.TITLE');
  }

  async ngOnInit() {
    try {
      this.showLoading = true;
      const neighborhood = await this.neighborhood.getNeighbors();
      if (this.sort) {
        this.dataSource.sort = this.sort;
        this.dataSource.sort.active = 'lot';
        this.dataSource.sort.direction = 'asc';
      }
      const data = neighborhood.map(_neighbor => {
        return { ..._neighbor, group: this.utils.getGroup(_neighbor) };
      });

      this.dataSource.data = data.slice(0, 20);
      setTimeout(() => {
        this.dataSource.data = data;
      }, 500);
    } catch (error) {
      console.log(error);
    } finally {
      this.showLoading = false;
    }
  }

  addNeighbor() {
    this.router.goTo({
      path: `/${APP_PATH.MENU}/${MENU_PATH.HOME}/${HOME_PATH.NEIGHBORHOOD}/${NEIGHBORHOOD_PATH.ADD}`
    });
  }

  editNeighbor(neighbor: INeighborRow) {
    if (!neighbor) {
      return;
    }

    this.router.goTo({
      path: `/${APP_PATH.MENU}/${MENU_PATH.HOME}/${HOME_PATH.NEIGHBORHOOD}/${neighbor.id}`
    });
  }

  onSearch(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.dataSource.filter = value.trim().toLowerCase();
  }
}
