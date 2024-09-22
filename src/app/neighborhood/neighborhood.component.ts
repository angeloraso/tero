import { AfterViewInit, Component, ElementRef, Inject, OnInit, ViewChild } from '@angular/core';
import { BizyPopupService } from '@bizy/services';
import { AVAILABLE_LOTS, LOGO_PATH } from '@core/constants';
import { NeighborsService, UserSettingsService } from '@core/services';
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
  lots: Array<ILot> = Array.from({ length: AVAILABLE_LOTS + 1 }, (_, index) => ({
    number: index,
    security: false,
    neighbors: []
  }));

  readonly LOGO_PATH = LOGO_PATH;

  constructor(
    @Inject(BizyPopupService) private popup: BizyPopupService,
    @Inject(NeighborsService) private neighborsService: NeighborsService,
    @Inject(UserSettingsService) private userSettingsService: UserSettingsService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      const [isConfig, isNeighbor, isSecurity] = await Promise.all([
        this.userSettingsService.isConfig(),
        this.userSettingsService.isNeighbor(),
        this.userSettingsService.isSecurity()
      ]);

      this.showInfo = isNeighbor || isSecurity || isConfig;
      if (!this.showInfo) {
        return;
      }

      const neighbors = await this.neighborsService.getNeighbors();
      neighbors.forEach(_neighbor => {
        if (this.lots[_neighbor.lot]) {
          if (!this.lots[_neighbor.lot].security) {
            this.lots[_neighbor.lot].security = _neighbor.security;
          }
          this.lots[_neighbor.lot].neighbors.push(_neighbor);
        }
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
