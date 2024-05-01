import { Component, Inject, OnInit } from '@angular/core';
import { LOGO_PATH } from '@core/constants';
import { Empty, ISecurityGuard } from '@core/model';
import { NeighborsService, SecurityService, UtilsService } from '@core/services';
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
  showLoading = false;
  securityStaff: Array<ISecurityGuard> = [];
  securityFee: number | Empty;
  groups: Array<IGroup> = [];
  contributors = 0;
  contributorFee = 0;
  readonly LOGO_PATH = LOGO_PATH;

  constructor(
    @Inject(NeighborsService) private neighbors: NeighborsService,
    @Inject(SecurityService) private security: SecurityService,
    @Inject(UtilsService) private utils: UtilsService
  ) {}

  async ngOnInit() {
    try {
      this.showLoading = true;
      this.groups.length = 0;
      this.contributors = 0;
      this.contributorFee = 0;
      const [neighbors, security] = await Promise.all([
        this.neighbors.getNeighbors(),
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
      console.error(error);
    } finally {
      this.showLoading = false;
    }
  }
}
