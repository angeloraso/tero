import { NoopScrollStrategy } from '@angular/cdk/overlay';
import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AVAILABLE_LOTS } from '@core/constants';
import { Empty } from '@core/model';
import { NeighborhoodService } from '@core/services';
import { HomeService } from '@home/home.service';
import { LotPopupComponent } from './components';
import { ILot } from './map.model';

@Component({
  selector: 'tero-map',
  templateUrl: './map.html',
  styleUrls: ['./map.css']
})
export class MapComponent implements OnInit, AfterViewInit {
  @ViewChild('mainEntrance') mainEntrance: ElementRef | Empty;
  showLoading = false;
  lots: Array<ILot> = Array.from({ length: AVAILABLE_LOTS + 1 }, (_, index) => ({
    number: index,
    security: false,
    neighbors: []
  }));

  constructor(
    @Inject(HomeService) private home: HomeService,
    @Inject(MatDialog) private dialog: MatDialog,
    @Inject(NeighborhoodService) private neighborhood: NeighborhoodService
  ) {
    this.home.updateTitle('MAP.TITLE');
  }

  async ngOnInit() {
    try {
      this.showLoading = true;
      const neighbors = await this.neighborhood.getNeighbors();
      neighbors.forEach(_neighbor => {
        if (this.lots[_neighbor.lot]) {
          this.lots[_neighbor.lot].security = _neighbor.security;
          this.lots[_neighbor.lot].neighbors.push(_neighbor);
        }
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.showLoading = false;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      if (this.mainEntrance) {
        this.mainEntrance.nativeElement.scrollIntoView({
          behavior: 'smooth'
        });
      }
    }, 100);
  }

  showLot(lot: ILot) {
    if (!lot) {
      return;
    }

    this.dialog.open(LotPopupComponent, {
      data: lot,
      scrollStrategy: new NoopScrollStrategy(),
      panelClass: 'tero-material-dialog'
    });
  }
}
