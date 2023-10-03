import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { NeighborhoodService } from '@neighborhood/neighborhood.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tero-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  private _subscription = new Subscription();
  total: number = 0.0;

  generalProfitLabels: Array<string> = [];
  generalProfitSeries: Array<Array<number>> = [];

  monthProfitLabels: Array<string> = [];
  monthProfitSeries: Array<Array<number>> = [];

  inflationLabels: Array<string> = [];
  inflationSeries: Array<Array<number>> = [];

  fixedRatesLabels: Array<string> = [];
  fixedRatesSeries: Array<Array<number>> = [];

  constructor(@Inject(NeighborhoodService) private neighborhood: NeighborhoodService) {}

  async ngOnInit() {
    try {
      const neighbors = await this.neighborhood.getNeighbors();
      console.log(neighbors);
    } catch (error) {
      console.debug(error);
    }
  }

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
