import { Component, Inject, OnInit } from '@angular/core';
import { BIZY_TAG_TYPE } from '@bizy/components';
import { BizyLogService, BizyToastService } from '@bizy/services';
import { LOGO_PATH } from '@core/constants';
import { Empty, ISecurityGuard } from '@core/model';
import {
  NeighborsService,
  SecurityService,
  UserSettingsService,
  UtilsService
} from '@core/services';
interface IGroup {
  value: number;
  lots: Set<number>;
  fee: number;
}
@Component({
  selector: 'tero-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit {
  loading = false;
  showInfo = false;
  securityStaff: Array<ISecurityGuard> = [];
  securityFee: number | Empty;
  groups: Array<IGroup> = [];
  contributors = 0;
  contributorFee = 0;
  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
  readonly LOGO_PATH = LOGO_PATH;

  constructor(
    @Inject(NeighborsService) private neighborsService: NeighborsService,
    @Inject(SecurityService) private security: SecurityService,
    @Inject(UtilsService) private utils: UtilsService,
    @Inject(BizyLogService) private log: BizyLogService,
    @Inject(BizyToastService) private toast: BizyToastService,
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

      this.groups.length = 0;
      this.contributors = 0;
      this.contributorFee = 0;
      const [neighbors, security] = await Promise.all([
        this.neighborsService.getNeighbors(),
        this.security.getSecurity()
      ]);

      const groups: Array<IGroup> = [];

      neighbors.forEach(_neighbor => {
        if (_neighbor.security) {
          if (!groups[this.utils.getGroup(_neighbor)]) {
            groups[this.utils.getGroup(_neighbor)] = {
              value: this.utils.getGroup(_neighbor),
              lots: new Set(),
              fee: 0
            };
          }

          groups[this.utils.getGroup(_neighbor)].lots.add(_neighbor.lot);
        }
      });

      if (security) {
        this.securityStaff = security.staff;
        this.securityFee = security.fee;
        groups.forEach(_group => {
          this.contributors += _group.lots.size;
        });

        this.contributorFee = this.utils.roundNumber(security.fee / this.contributors) ?? 0;
        this.groups = groups.map(_group => {
          return { ..._group, fee: this.utils.roundNumber(this.contributorFee * _group.lots.size) };
        });
      }
    } catch (error) {
      this.log.error({
        fileName: 'dashboard.component',
        functionName: 'ngOnInit',
        param: error
      });
      this.toast.danger();
    } finally {
      this.loading = false;
    }
  }
}
