import { Component, EventEmitter, Input, Output } from '@angular/core';
import { BIZY_TAG_TYPE } from '@bizy/components';
import { ILot } from '@neighborhood/neighborhood.model';

@Component({
    selector: 'tero-lot',
    templateUrl: './lot.html',
    styleUrls: ['./lot.css'],
    standalone: false
})
export class LotComponent {
  @Input() lot: ILot | null = null;
  @Input() showControls: boolean = true;
  @Output() onSelect = new EventEmitter<void>();

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
}
