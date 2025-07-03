import { DatePipe } from '@angular/common';
import { AfterViewInit, Component, DOCUMENT, ElementRef, inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BizyExportToCSVService, BizyLogService, BizyPopupService, BizyToastService, BizyTranslateService } from '@bizy/core';
import { LOGO_PATH, LOTS } from '@core/constants';
import { MobileService, NeighborsService, UsersService } from '@core/services';
import { FILE_TYPE } from '@core/services/mobile.service';
import { ENV } from '@env/environment';
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
  readonly #exportToCSV = inject(BizyExportToCSVService);

  loading = false;
  isConfig: boolean = false;
  showInfo: boolean = false;
  lots: Array<ILot> = LOTS;
  downloading: boolean = false;
  csvLoading: boolean = false;
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

      this.isConfig = isConfig;
      const neighbors = await this.#neighborsService.getNeighbors();
      this.lots.forEach(_lot => {
        _lot.neighbors.length = 0;
      });
      neighbors.forEach(_neighbor => {
        this.lots[Number(_neighbor.lot)].neighbors.push(_neighbor);
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

  async export() {
    try {
      if (this.csvLoading) {
        return;
      }

      this.csvLoading = true;

      const items = this.lots.map(_lot => {
        return {
          ..._lot,
          _name: _lot.neighbors && _lot.neighbors.length > 0 && _lot.neighbors[0].name ? _lot.neighbors[0].name : null,
          _surname: _lot.neighbors && _lot.neighbors.length > 0 && _lot.neighbors[0].surname ? _lot.neighbors[0].surname : null,
          _email: _lot.neighbors && _lot.neighbors.length > 0 && _lot.neighbors[0].email ? _lot.neighbors[0].email : null,
          _alarmNumber: _lot.neighbors && _lot.neighbors.length > 0 && _lot.neighbors[0].alarmNumber ? _lot.neighbors[0].alarmNumber : null,
          _alarmControls:
            _lot.neighbors && _lot.neighbors.length > 0 && _lot.neighbors[0].alarmControls ? _lot.neighbors[0].alarmControls.join() : null,
          _security:
            _lot.neighbors && _lot.neighbors.length > 0 && _lot.neighbors[0].security
              ? this.#translate.get('CORE.YES')
              : this.#translate.get('CORE.NO')
        };
      });

      // Remove lot 0
      items.shift();

      const fileName = this.#translate.get('NEIGHBORHOOD.CSV_FILE_NAME');
      const model = {
        number: this.#translate.get('CORE.FORM.FIELD.LOT'),
        _name: this.#translate.get('CORE.FORM.FIELD.NAME'),
        _surname: this.#translate.get('CORE.FORM.FIELD.SURNAME'),
        _email: this.#translate.get('CORE.FORM.FIELD.EMAIL'),
        houseNumber: this.#translate.get('CORE.FORM.FIELD.HOUSE_NUMBER'),
        cadastralNumber: this.#translate.get('NEIGHBORHOOD.DATA.CADASTRAL_NUMBER'),
        district: this.#translate.get('NEIGHBORHOOD.DATA.DISTRICT'),
        cadastralJurisdiction: this.#translate.get('NEIGHBORHOOD.DATA.CADASTRAL_JURISDICTION'),
        section: this.#translate.get('NEIGHBORHOOD.DATA.SECTION'),
        subdivision: this.#translate.get('NEIGHBORHOOD.DATA.SUBDIVISION'),
        block: this.#translate.get('NEIGHBORHOOD.DATA.BLOCK'),
        parcel: this.#translate.get('NEIGHBORHOOD.DATA.PARCEL'),
        _security: this.#translate.get('CORE.FORM.FIELD.SECURITY'),
        _alarmNumber: this.#translate.get('CORE.FORM.FIELD.ALARM_NUMBER'),
        _alarmControls: this.#translate.get('CORE.FORM.FIELD.ALARM_CONTROLS')
      };

      if (ENV.mobile) {
        const csv = this.#exportToCSV.getCSV({ items, model });
        await this.#mobile.downloadFile({ data: csv, name: fileName });
      } else {
        this.#exportToCSV.download({ items, model, fileName });
      }
    } catch (error) {
      this.#log.error({
        fileName: 'neighborhood.component',
        functionName: 'export',
        param: error
      });
      this.#toast.danger({
        title: 'Error',
        msg: `${this.#translate.get('CORE.FORM.ERROR.APP')}: Excel, Spreadsheet, etc`
      });
    } finally {
      this.csvLoading = false;
    }
  }

  download = async () => {
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

      if (ENV.mobile) {
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
