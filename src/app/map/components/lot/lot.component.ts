import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Empty } from '@core/model';
import { ILot } from '@map/map.model';

@Component({
  selector: 'tero-lot',
  templateUrl: './lot.html',
  styleUrls: ['./lot.css']
})
export class LotComponent {
  @Input() lot: ILot | Empty;
  @Output() onClick = new EventEmitter<void>();
}
