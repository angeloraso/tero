import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { BizyPopupService } from '@bizy/services';
import { LOGO_PATH, LOTS } from '@core/constants';
import { NeighborsService, UsersService } from '@core/services';
import { LotPopupComponent } from './components';
import { ILot } from './neighborhood.model';

@Component({
  selector: 'tero-neighborhood',
  templateUrl: './neighborhood.html',
  styleUrls: ['./neighborhood.css']
})
export class NeighborhoodComponent implements OnInit, AfterViewInit {
  @ViewChild('mainEntrance') mainEntrance: ElementRef | null = null;
  loading = false;
  showInfo: boolean = false;
  lots: Array<ILot> = LOTS;

  readonly LOGO_PATH = LOGO_PATH;

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(NeighborsService) private neighborsService: NeighborsService,
    @Inject(UsersService) private usersService: UsersService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      const [isConfig, isNeighbor, isSecurity] = await Promise.all([
        this.usersService.isConfig(),
        this.usersService.isNeighbor(),
        this.usersService.isSecurity()
      ]);

      this.showInfo = isNeighbor || isSecurity || isConfig;
      if (!this.showInfo) {
        return;
      }

      const neighbors = await this.neighborsService.getNeighbors();
      this.lots.forEach(_lot => {
        _lot.neighbors.length = 0;
      });
      neighbors.forEach(_neighbor => {
        this.lots[_neighbor.lot].neighbors.push(_neighbor);
      });
    } catch (error) {
      console.error(error);
    } finally {
      this.loading = false;
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
    if (!lot || !this.showInfo) {
      return;
    }

    this.popup.open<void>({
      component: LotPopupComponent,
      data: lot
    });
  }
}
