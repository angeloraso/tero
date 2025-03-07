import { Component, inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { SharedModules } from '@app/shared';
import {
  BIZY_SKELETON_SHAPE,
  BIZY_TAG_TYPE,
  BizyExportToCSVService,
  BizyFilterPipe,
  BizyLogService,
  BizyOrderByPipe,
  BizyPopupService,
  BizyRouterService,
  BizySearchPipe,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { PopupComponent } from '@components/popup';
import { LOGO_PATH } from '@core/constants';
import { INeighbor } from '@core/model';
import { MobileService, NeighborsService, UsersService } from '@core/services';
import { PATH as HOME_PATH } from '@home/home.routing';
import { PATH as NEIGHBORS_PATH } from '@neighbors/neighbors.routing';
import { es } from './i18n';

interface INeighborExtended extends INeighbor {
  _alarmControls: Array<string>;
}

@Component({
    selector: 'tero-neighbors',
    templateUrl: './neighbors.html',
    styleUrls: ['./neighbors.css'],
    imports: SharedModules
})
export class NeighborsComponent implements OnInit {
  readonly #router = inject(BizyRouterService);
  readonly #neighborsService = inject(NeighborsService);
  readonly #log = inject(BizyLogService);
  readonly #toast = inject(BizyToastService);
  readonly #translate = inject(BizyTranslateService);
  readonly #mobile = inject(MobileService);
  readonly #exportToCSV = inject(BizyExportToCSVService);
  readonly #searchPipe = inject(BizySearchPipe);
  readonly #orderByPipe = inject(BizyOrderByPipe);
  readonly #filterPipe = inject(BizyFilterPipe);
  readonly #usersService = inject(UsersService);
  readonly #popup = inject(BizyPopupService);

  loading = false;
  csvLoading = false;
  securityLoading = false;
  isConfig = false;
  isNeighbor = false;
  isSecurity = false;
  neighbors: Array<INeighborExtended> = [];
  search: string | number = '';
  searchKeys: Array<string> = ['group', 'lot', 'surname', 'name', 'alarmNumber', '_alarmControls'];
  lotSearch: string = '';
  surnameSearch: string = '';
  nameSearch: string = '';
  filterGroups: Array<{ id: number | boolean; value: number | string; selected: boolean }> = [];
  filterAlarmControls: Array<{ id: boolean; value: string; selected: boolean }> = [];
  activatedFilters: number = 0;
  orderBy: string = 'name';
  order: 'asc' | 'desc' = 'asc';
  isMobile = this.#mobile.isMobile();

  readonly LOGO_PATH = LOGO_PATH;
  readonly BIZY_SKELETON_SHAPE = BIZY_SKELETON_SHAPE;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;

  async ngOnInit() {
    try {
      this.loading = true;
      this.#translate.loadTranslations(es);
      const [isConfig, isNeighbor, isSecurity] = await Promise.all([
        this.#usersService.isConfig(),
        this.#usersService.isNeighbor(),
        this.#usersService.isSecurity()
      ]);

      this.isNeighbor = isNeighbor;
      this.isSecurity = isSecurity;
      this.isConfig = isConfig;
      if (!this.isNeighbor && !this.isConfig && !this.isSecurity) {
        return;
      }

      const neighbors = await this.#neighborsService.getNeighbors();

      this.neighbors = neighbors
        ? neighbors.map(_neighbor => {
            return {
              ..._neighbor,
              _alarmControls: _neighbor.alarmControls
                ? _neighbor.alarmControls.map(_value => String(_value))
                : []
            };
          })
        : [];

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
        value: this.#translate.get('NEIGHBORS.NO_GROUP'),
        selected: true
      });

      this.filterAlarmControls = [
        { id: true, value: this.#translate.get('NEIGHBORS.CONTROL'), selected: true },
        { id: false, value: this.#translate.get('NEIGHBORS.NO_CONTROL'), selected: true }
      ];
    } catch (error) {
      this.#log.error({
        fileName: 'neighbors.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.#toast.danger();
    } finally {
      this.loading = false;
    }
  }

  addNeighbor() {
    if (!this.isConfig) {
      return;
    }

    this.#router.goTo({ path: `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORS}/${NEIGHBORS_PATH.ADD}` });
  }

  selectNeighbor(neighbor: INeighbor) {
    if (!neighbor || !this.isConfig) {
      return;
    }

    this.#router.goTo({ path: `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORS}/${neighbor.id}` });
  }

  removeNeighborFromSecurity(neighbor: INeighbor) {
    if (!neighbor || this.securityLoading || !this.isConfig) {
      return;
    }

    this.#popup.open<boolean>(
      {
        component: PopupComponent,
        data: {
          title: this.#translate.get('NEIGHBORS.SECURITY.TITLE'),
          msg: `${this.#translate.get('NEIGHBORS.SECURITY.MSG')}: ${neighbor.surname} ${neighbor.name}`
        }
      },
      async res => {
        try {
          if (res) {
            this.securityLoading = true;
            await this.#neighborsService.putNeighbor({ ...neighbor, security: false });
            neighbor.security = false;
            this.refresh();
          }
        } catch (error) {
          this.#log.error({
            fileName: 'neighbors.component',
            functionName: 'removeNeighborFromSecurity',
            param: error
          });
          this.#toast.danger()
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
            ? this.#translate.get('CORE.YES')
            : this.#translate.get('CORE.NO')
        };
      });

      const fileName = this.#translate.get('NEIGHBORS.CSV_FILE_NAME');
      const model = {
        group: this.#translate.get('CORE.FORM.FIELD.GROUP'),
        lot: this.#translate.get('CORE.FORM.FIELD.LOT'),
        surname: this.#translate.get('CORE.FORM.FIELD.SURNAME'),
        name: this.#translate.get('CORE.FORM.FIELD.NAME'),
        _security: this.#translate.get('CORE.FORM.FIELD.SECURITY')
      };

      if (this.isMobile) {
        const csv = this.#exportToCSV.getCSV({ items, model });
        await this.#mobile.downloadFile({ data: csv, name: fileName });
      } else {
        this.#exportToCSV.download({ items, model, fileName });
      }
    } catch (error) {
      this.#log.error({
        fileName: 'neighbors.component',
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

  #filter(items: Array<INeighbor>): Array<INeighbor> {
    let _items = this.#filterPipe.transform(items, 'group', this.filterGroups);
    _items = this.#filterPipe.transform(items, 'alarmNumber', this.filterAlarmControls);
    _items = this.#searchPipe.transform(_items, this.search, [
      'group',
      'lot',
      'surname',
      'name'
    ]);
    _items = this.#searchPipe.transform(_items, this.lotSearch, 'lot');
    _items = this.#searchPipe.transform(_items, this.surnameSearch, 'surname');
    _items = this.#searchPipe.transform(_items, this.nameSearch, 'name');
    _items = this.#orderByPipe.transform(_items, this.order, this.orderBy);
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
    this.order = this.order === 'desc' || this.orderBy !== property ? 'asc' : 'desc';
    this.orderBy = property;
  }
}
