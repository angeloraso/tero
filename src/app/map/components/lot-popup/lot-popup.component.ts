import { DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, Inject } from '@angular/core';
import { ILot } from '@map/map.model';

@Component({
  selector: 'tero-lot-popup',
  templateUrl: './lot-popup.html',
  styleUrls: ['./lot-popup.css']
})
export class LotPopupComponent {
  constructor(@Inject(DIALOG_DATA) public data: ILot) {}
}
