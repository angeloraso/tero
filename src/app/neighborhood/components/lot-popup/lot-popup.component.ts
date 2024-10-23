import { Component, Inject } from '@angular/core';
import { BIZY_TAG_TYPE } from '@bizy/components';
import { BizyPopupService } from '@bizy/services';
import { ILot } from '@neighborhood/neighborhood.model';

@Component({
  selector: 'tero-lot-popup',
  templateUrl: './lot-popup.html',
  styleUrls: ['./lot-popup.css']
})
export class LotPopupComponent {
  data: ILot;

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;

  constructor(@Inject(BizyPopupService) public popup: BizyPopupService) {
    this.data = this.popup.getData<ILot>();
  }
}
