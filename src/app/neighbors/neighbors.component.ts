import { Component, Inject, OnInit } from '@angular/core';
import { PATH as APP_PATH } from '@app/app.routing';
import { BIZY_TAG_TYPE, BizyFilterPipe } from '@bizy/components';
import { BizyOrderByPipe, BizySearchPipe } from '@bizy/pipes';
import {
  BizyExportToCSVService,
  BizyLogService,
  BizyPopupService,
  BizyRouterService,
  BizyTranslateService
} from '@bizy/services';
import { LOGO_PATH } from '@core/constants';
import { INeighbor } from '@core/model';
import { NeighborsService, UserSettingsService } from '@core/services';
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
  securityLoading = false;
  isConfig = false;
  isNeighbor = false;
  isSecurity = false;
  neighbors: Array<INeighbor> = [];
  search: string | number = '';
  lotSearch: string | number = '';
  surnameSearch: string | number = '';
  nameSearch: string | number = '';
  filterGroups: Array<{ id: number; value: number; selected: boolean }> = [];
  activatedFilters: number = 0;
  orderBy: string = 'lot';
  order: 'asc' | 'desc' | null = 'asc';

  readonly LOGO_PATH = LOGO_PATH;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;

  constructor(
    @Inject(BizyRouterService) private router: BizyRouterService,
    @Inject(NeighborsService) private neighborsService: NeighborsService,
    @Inject(UserSettingsService) private userSettingsService: UserSettingsService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyTranslateService) private translate: BizyTranslateService,
    @Inject(BizyExportToCSVService) private exportToCSV: BizyExportToCSVService,
    @Inject(BizySearchPipe) private bizySearchPipe: BizySearchPipe,
    @Inject(BizyFilterPipe) private bizyFilterPipe: BizyFilterPipe,
    @Inject(BizyOrderByPipe) private bizyOrderByPipe: BizyOrderByPipe,
    @Inject(BizyPopupService) private popup: BizyPopupService
  ) {}

  async ngOnInit() {
    try {
      this.loading = true;
      const [isConfig, isNeighbor, isSecurity] = await Promise.all([
        this.userSettingsService.isConfig(),
        this.userSettingsService.isNeighbor(),
        this.userSettingsService.isSecurity()
      ]);

      this.isNeighbor = isNeighbor;
      this.isSecurity = isSecurity;
      this.isConfig = isConfig;
      if (!this.isNeighbor && !this.isConfig) {
        return;
      }

      this.neighbors = (await this.neighborsService.getNeighbors()) ?? [];

      const groups = new Set<number>();

      this.neighbors.forEach(_neighbor => {
        groups.add(_neighbor.group);
      });

      this.filterGroups = Array.from(groups)
        .sort()
        .map(_group => {
          return { id: _group, value: _group, selected: true };
        });
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
    if (!neighbor || this.securityLoading || (!this.isConfig && !this.isSecurity)) {
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

  export() {
    if (!this.neighbors || this.neighbors.length === 0 || !this.isConfig) {
      return;
    }

    const items = this.#filter(this.neighbors).map(_neighbor => {
      return {
        ..._neighbor,
        _security: _neighbor.security
          ? this.translate.get('CORE.YES')
          : this.translate.get('CORE.NO')
      };
    });

    this.exportToCSV.downloadCSV({
      items,
      model: {
        group: this.translate.get('CORE.FORM.FIELD.GROUP'),
        lot: this.translate.get('CORE.FORM.FIELD.LOT'),
        surname: this.translate.get('CORE.FORM.FIELD.SURNAME'),
        name: this.translate.get('CORE.FORM.FIELD.NAME'),
        _security: this.translate.get('CORE.FORM.FIELD.SECURITY')
      },
      fileName: this.translate.get('NEIGHBORS.CSV_FILE_NAME')
    });
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
    this.orderBy = '';
    this.order = null;
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
    this.order = this.order === 'asc' ? 'desc' : this.order === 'desc' ? null : 'asc';
  }
}
