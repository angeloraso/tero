import { Component, Inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { BIZY_TAG_TYPE, BizyFilterPipe } from '@bizy/components';
import { BizyOrderByPipe, BizySearchPipe } from '@bizy/pipes';
import {
  BizyExportToCSVService,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/services';
import { LOGO_PATH } from '@core/constants';
import { INeighbor } from '@core/model';
import { MobileService, NeighborsService, UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { PATH as NEIGHBORS_PATH } from '@neighbors/neighbors.routing';
import { PopupComponent } from '@shared/components';

@Component({
  selector: 'tero-neighbors',
  templateUrl: './neighbors.html',
  styleUrls: ['./neighbors.css']
})
export class NeighborsComponent implements OnInit {
  loading = false;
  csvLoading = false;
  securityLoading = false;
  isConfig = false;
  isNeighbor = false;
  isSecurity = false;
  neighbors: Array<INeighbor> = [];
  search: string | number = '';
  searchKeys: Array<string> = ['group', 'lot', 'surname', 'name', 'alarmNumber', 'alarmControls'];
  lotSearch: string = '';
  surnameSearch: string = '';
  nameSearch: string = '';
  filterGroups: Array<{ id: number | boolean; value: number | string; selected: boolean }> = [];
  filterAlarmNumbers: Array<{ id: number | boolean; value: number | string; selected: boolean }> =
    [];
  filterAlarmControls: Array<{ id: boolean; value: string; selected: boolean }> = [];
  activatedFilters: number = 0;
  orderBy: string = 'lot';
  order: 'asc' | 'desc' = 'asc';
  isMobile = true;

  readonly LOGO_PATH = LOGO_PATH;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;

  constructor(
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(NeighborsService) private neighborsService: NeighborsService,
    @Inject(UsersService) private usersService: UsersService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
    @Inject(MobileService) private mobile: MobileService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService,
    @Inject(BizyExportToCSVService) private exportToCSV: BizyExportToCSVService,
    @Inject(BizySearchPipe) private bizySearchPipe: BizySearchPipe,
    @Inject(BizyFilterPipe) private bizyFilterPipe: BizyFilterPipe,
    @Inject(BizyOrderByPipe) private bizyOrderByPipe: BizyOrderByPipe,
    @Inject(BizyPopupService) private popup: BizyPopupService
  ) {
    this.isMobile = this.mobile.isMobile();
  }

  async ngOnInit() {
    try {
      this.loading = true;
      const [isConfig, isNeighbor, isSecurity] = await Promise.all([
        this.usersService.isConfig(),
        this.usersService.isNeighbor(),
        this.usersService.isSecurity()
      ]);

      this.isNeighbor = isNeighbor;
      this.isSecurity = isSecurity;
      this.isConfig = isConfig;
      if (!this.isNeighbor && !this.isConfig && !this.isSecurity) {
        return;
      }

      this.neighbors = (await this.neighborsService.getNeighbors()) ?? [];

      const groups = new Set<number>();
      const alarmNumbers = new Set<number>();

      this.neighbors.forEach(_neighbor => {
        if (_neighbor.group) {
          groups.add(Number(_neighbor.group));
        }

        if (_neighbor.alarmNumber) {
          alarmNumbers.add(Number(_neighbor.alarmNumber));
        }
      });

      this.filterGroups = Array.from(groups).map(_group => {
        return { id: _group, value: _group, selected: true };
      });

      this.filterGroups.unshift({
        id: false,
        value: this.translate.get('NEIGHBORS.NO_GROUP'),
        selected: true
      });

      this.filterAlarmNumbers = Array.from(alarmNumbers).map(_alarmNumber => {
        return { id: _alarmNumber, value: _alarmNumber, selected: true };
      });

      this.filterAlarmNumbers.unshift({
        id: false,
        value: this.translate.get('NEIGHBORS.NO_ALARM'),
        selected: true
      });

      this.filterAlarmControls = [
        { id: true, value: this.translate.get('NEIGHBORS.CONTROL'), selected: true },
        { id: false, value: this.translate.get('NEIGHBORS.NO_CONTROL'), selected: true }
      ];
    } catch (error) {
      this.log.error({
        fileName: 'neighbors.component',
        functionName: 'ngOnInit',
        param: error
      });
    } finally {
      this.loading = false;
    }
  }

  addNeighbor() {
    if (!this.isConfig) {
      return;
    }

    this.router.goTo({ path: `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORS}/${NEIGHBORS_PATH.ADD}` });
  }

  editNeighbor(neighbor: INeighbor) {
    if (!neighbor || !this.isConfig) {
      return;
    }

    this.router.goTo({ path: `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORS}/${neighbor.id}` });
  }

  removeNeighborFromSecurity(neighbor: INeighbor) {
    if (!neighbor || this.securityLoading || !this.isConfig) {
      return;
    }

    this.popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.translate.get('NEIGHBORS.SECURITY.TITLE'),
          msg: `${this.translate.get('NEIGHBORS.SECURITY.MSG')}: ${neighbor.surname} ${neighbor.name}`
        }
      },
      async res => {
        try {
          if (res) {
            this.securityLoading = true;
            await this.neighborsService.putNeighbor({ ...neighbor, security: false });
            neighbor.security = false;
            this.refresh();
          }
        } catch (error) {
          this.log.error({
            fileName: 'neighbors.component',
            functionName: 'removeNeighborFromSecurity',
            param: error
          });
        } finally {
          this.securityLoading = false;
        }
      }
    );
  }

  async export() {
    try {
      if (
        this.csvLoading ||
        this.loading ||
        !this.neighbors ||
        this.neighbors.length === 0 ||
        !this.isConfig
      ) {
        return;
      }

      this.csvLoading = true;

      const items = this.#filter(this.neighbors).map(_neighbor => {
        return {
          ..._neighbor,
          _security: _neighbor.security
            ? this.translate.get('CORE.YES')
            : this.translate.get('CORE.NO')
        };
      });

      const fileName = this.translate.get('NEIGHBORS.CSV_FILE_NAME');
      const model = {
        group: this.translate.get('CORE.FORM.FIELD.GROUP'),
        lot: this.translate.get('CORE.FORM.FIELD.LOT'),
        surname: this.translate.get('CORE.FORM.FIELD.SURNAME'),
        name: this.translate.get('CORE.FORM.FIELD.NAME'),
        _security: this.translate.get('CORE.FORM.FIELD.SECURITY')
      };

      if (this.isMobile) {
        const csv = this.exportToCSV.getCSV({ items, model });
        await this.mobile.downloadFile({ data: csv, name: fileName });
      } else {
        this.exportToCSV.download({ items, model, fileName });
      }
    } catch (error) {
      this.log.error({
        fileName: 'neighbors.component',
        functionName: 'export',
        param: error
      });
      this.toast.danger({
        title: 'Error',
        msg: `${this.translate.get('CORE.FORM.ERROR.APP')}: Excel, Spreadsheet, etc`
      });
    } finally {
      this.csvLoading = false;
    }
  }

  #filter(items: Array<INeighbor>): Array<INeighbor> {
    let _items = this.bizyFilterPipe.transform(items, 'group', this.filterGroups);
    _items = this.bizySearchPipe.transform(_items, this.search, [
      'group',
      'lot',
      'surname',
      'name'
    ]);
    _items = this.bizySearchPipe.transform(_items, this.lotSearch, 'lot');
    _items = this.bizySearchPipe.transform(_items, this.surnameSearch, 'surname');
    _items = this.bizySearchPipe.transform(_items, this.nameSearch, 'name');
    _items = this.bizyOrderByPipe.transform(_items, this.order, this.orderBy);
    return _items;
  }

  checkFilters(activated: boolean) {
    if (activated) {
      this.activatedFilters++;
    } else if (this.activatedFilters > 0) {
      this.activatedFilters--;
    }
  }

  onRemoveFilters() {
    this.search = '';
    this.lotSearch = '';
    this.surnameSearch = '';
    this.nameSearch = '';
    this.filterGroups.forEach(_group => {
      _group.selected = true;
    });
    this.activatedFilters = 0;
    this.refresh();
  }

  refresh() {
    this.neighbors = [...this.neighbors];
  }

  onSort(property: string) {
    this.orderBy = property;
    this.order = this.order === 'asc' ? 'desc' : 'asc';
  }
}
