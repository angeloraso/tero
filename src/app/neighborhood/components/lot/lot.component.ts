import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ILot } from '@neighborhood/neighborhood.model';

@Component({
  selector: 'tero-lot',
  templateUrl: './lot.html',
  styleUrls: ['./lot.css']
})
export class LotComponent {
  @Input() lot: ILot | null = null;
  @Output() onClick = new EventEmitter<void>();
}
