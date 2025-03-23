import { DatePipe, DOCUMENT } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  OnInit,
  Renderer2,
  ViewChild
} from '@angular/core';
import { SharedModules } from '@app/shared';
import {
  BizyLogService,
  BizyPopupService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { LOGO_PATH, LOTS } from '@core/constants';
import { MobileService, NeighborsService, UsersService } from '@core/services';
import { FILE_TYPE } from '@core/services/mobile.service';
import { HomeService } from '@home/home.service';
import html2canvas from 'html2canvas';
import { LotComponent, LotPopupComponent } from './components';
import { es } from './i18n';
import { ILot } from './neighborhood.model';

@Component({
    selector: 'tero-neighborhood',
    templateUrl: './neighborhood.html',
    styleUrls: ['./neighborhood.css'],
    imports: [...SharedModules, LotComponent]
})
export class NeighborhoodComponent implements OnInit, AfterViewInit {
  @ViewChild('firstBlock') firstBlock: ElementRef | null = null;
  @ViewChild('mainEntrance') mainEntrance: ElementRef | null = null;
  @ViewChild('neighborhood') neighborhood: ElementRef | null = null;

  readonly #translate = inject(BizyTranslateService);
  readonly #popup = inject(BizyPopupService);
  readonly #mobile = inject(MobileService);
  readonly #neighborsService = inject(NeighborsService);
  readonly #usersService = inject(UsersService);
  readonly #document = inject(DOCUMENT);
  readonly #renderer = inject(Renderer2);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #datePipe = inject(DatePipe);
  readonly #home = inject(HomeService);

  loading = false;
  showInfo: boolean = false;
  lots: Array<ILot> = LOTS;
  downloading: boolean = false;
  showControls: boolean = true;

  readonly LOGO_PATH = LOGO_PATH;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#home.showTabs();
      this.#translate.loadTranslations(es);
      const [isConfig, isNeighbor, isSecurity] = await Promise.all([
        this.#usersService.isConfig(),
        this.#usersService.isNeighbor(),
        this.#usersService.isSecurity()
      ]);

      this.showInfo = isNeighbor || isSecurity || isConfig;
      if (!this.showInfo) {
        return;
      }

      const neighbors = await this.#neighborsService.getNeighbors();
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

    this.#popup.open<void>({
      component: LotPopupComponent,
      data: lot
    });
  }

  export = async () => {
    try {
      if (!this.neighborhood) {
        return;
      }

      this.downloading = true;

      await new Promise(resolve => setTimeout(resolve, 1));

      if (this.firstBlock) {
        this.firstBlock.nativeElement.scrollIntoView();
      }

      const mapElement = this.neighborhood!.nativeElement;

      const originalPosition = mapElement.style.position;
      const originalTopPosition = mapElement.style.top;
      const originalLeftPosition = mapElement.style.left;
      const originalWidth = mapElement.style.width;
      const originalHeight = mapElement.style.height;
      this.#renderer.setStyle(mapElement, 'position', 'absolute');
      this.#renderer.setStyle(mapElement, 'top', '0');
      this.#renderer.setStyle(mapElement, 'left', '0');
      this.#renderer.setStyle(mapElement, 'width', `${mapElement.scrollWidth}px`);
      this.#renderer.setStyle(mapElement, 'height', `${mapElement.scrollHeight}px`);

      const canvas = await html2canvas(mapElement);
      const pngDataUrl = canvas.toDataURL('image/png');

      this.#renderer.setStyle(mapElement, 'position', originalPosition);
      this.#renderer.setStyle(mapElement, 'top', originalTopPosition);
      this.#renderer.setStyle(mapElement, 'left', originalLeftPosition);
      this.#renderer.setStyle(mapElement, 'width', originalWidth);
      this.#renderer.setStyle(mapElement, 'height', originalHeight);

      const date = new Date();
      const fileName = `${this.#datePipe.transform(date, 'yyyyMMddHHmmss')}_${this.#translate.get('NEIGHBORHOOD.PNG_FILE_NAME')}`;

      if (this.#mobile.isMobile()) {
        const base64Data = pngDataUrl.split(',')[1];
        await this.#mobile.downloadFile({
          name: fileName,
          data: base64Data,
          type: FILE_TYPE.IMAGE
        });
      } else {
        const link = this.#renderer.createElement('a');
        link.href = pngDataUrl;
        link.download = fileName;
        this.#renderer.appendChild(this.#document.body, link);
        link.click();
        this.#renderer.removeChild(this.#document.body, link);
      }

      this.downloading = false;
    } catch (error) {
      this.#log.error({
        fileName: 'neighborhood.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
      this.downloading = false;
    }
  };
}
