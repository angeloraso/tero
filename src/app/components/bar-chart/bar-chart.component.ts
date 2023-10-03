import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, Inject, Input, Renderer2 } from '@angular/core';
import { BarChart } from 'chartist';

@Component({
  selector: 'tero-bar-chart',
  templateUrl: 'bar-chart.html',
  styleUrls: ['bar-chart.css']
})
export class BarChartComponent implements AfterViewInit {
  @Input() id: string = '';
  @Input() title: string = '';
  @Input() low: number = 0;
  @Input() showArea: boolean = true;

  readonly CHART_ID = 'tero-bar-chart';

  private _afterViewInit = false;

  private _labels: Array<number | string> | null = null;
  private _series: Array<Array<number>> | null = null;

  @Input() set labels(labels: Array<number | string>) {
    if (!labels) {
      return;
    }

    this._labels = labels;

    if (this._afterViewInit && this._series) {
      this._buildChart({ id: this.id, labels: this._labels, series: this._series });
    }
  }

  @Input() set series(series: Array<Array<number>>) {
    if (!series) {
      return;
    }

    this._series = series;

    if (this._afterViewInit && this._labels) {
      this._buildChart({ id: this.id, labels: this._labels, series: this._series });
    }
  }

  constructor(
    @Inject(Renderer2) private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngAfterViewInit() {
    this._afterViewInit = true;
    if (this._labels && this._series) {
      this._buildChart({ id: this.id, labels: this._labels, series: this._series });
    }
  }

  private _buildChart(data: {
    id: string;
    labels: Array<number | string>;
    series: Array<Array<number>>;
  }) {
    const element = this.document.getElementById(`${this.CHART_ID}-${data.id}`);
    if (!element) {
      return;
    }

    new BarChart(
      `#${this.CHART_ID}-${data.id}`,
      {
        labels: data.labels,
        series: data.series
      },
      {
        height: 200,
        low: this.low
      }
    );

    setTimeout(() => {
      const elements = Array.from(this.document.getElementsByTagName('foreignObject'));
      elements.forEach(_element => {
        const child = _element.firstChild as HTMLElement;
        if (
          child &&
          child.classList.contains('ct-label') &&
          child.classList.contains('ct-horizontal') &&
          child.classList.contains('ct-end')
        ) {
          this.renderer.setStyle(child, 'transform', 'rotate(30deg)');
          this.renderer.setStyle(child, 'position', 'relative');
          this.renderer.setStyle(child, 'top', '1em');
          this.renderer.setStyle(child, 'right', '1em');
          this.renderer.setStyle(child, 'font-size', '0.6em');
        }
      });
    }, 1);
  }
}
