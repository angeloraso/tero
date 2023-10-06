import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'tero-dashboard',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class DashboardComponent implements OnDestroy {
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

  ngOnDestroy() {
    this._subscription.unsubscribe();
  }
}
