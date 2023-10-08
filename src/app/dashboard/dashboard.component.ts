import { Component, Inject, OnInit } from '@angular/core';
import { Empty } from '@core/model';
import { NeighborhoodService, SettingsService, UtilsService } from '@core/services';
import { HomeService } from '@home/home.service';

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
  securityFee: number | Empty;
  groups: Array<IGroup> = [];
  contributors = 0;

  constructor(
    @Inject(HomeService) private home: HomeService,
    @Inject(NeighborhoodService) private neighborhood: NeighborhoodService,
    @Inject(SettingsService) private settings: SettingsService,
    @Inject(UtilsService) private utils: UtilsService
  ) {
    this.home.updateTitle('DASHBOARD.TITLE');
  }

  async ngOnInit() {
    try {
      this.showLoading = true;
      this.groups.length = 0;
      this.contributors = 0;
      const [neighborhood, security] = await Promise.all([
        this.neighborhood.getNeighbors(),
        this.settings.getSecurity()
      ]);

      const groups: Array<IGroup> = [];

      neighborhood.forEach(_neighbor => {
        if (_neighbor.security) {
          if (groups[this.utils.getGroup(_neighbor)]) {
            groups[this.utils.getGroup(_neighbor)].lots.add(_neighbor.lot);
          } else {
            groups[this.utils.getGroup(_neighbor)] = {
              value: this.utils.getGroup(_neighbor),
              lots: new Set(),
              fee: 0
            };

            groups[this.utils.getGroup(_neighbor)].lots.add(_neighbor.lot);
          }
        }
      });

      if (security && security.fee) {
        this.securityFee = security.fee;
        groups.forEach(_group => {
          this.contributors += _group.lots.size;
        });

        const neighborFee = this.utils.roundNumber(security.fee / this.contributors);
        this.groups = groups.map(_group => {
          return { ..._group, fee: this.utils.roundNumber(neighborFee * _group.lots.size) };
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      this.showLoading = false;
    }
  }
}
