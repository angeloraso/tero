import { Component, Inject } from '@angular/core';
import { BizyPopupService } from '@bizy/services';
import { ILot } from '@neighborhood/neighborhood.model';

@Component({
  selector: 'tero-lot-popup',
  templateUrl: './lot-popup.html',
  styleUrls: ['./lot-popup.css']
})
export class LotPopupComponent {
  data: ILot;
  constructor(@Inject(BizyPopupService) public popup: BizyPopupService) {
    this.data = this.popup.getData<ILot>();
  }
}
