import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SharedModules } from '@app/shared';
import { BIZY_TAG_TYPE } from '@bizy/core';
import { ILot } from '@neighborhood/neighborhood.model';

@Component({
  selector: 'tero-lot',
  templateUrl: './lot.html',
  styleUrls: ['./lot.css'],
  imports: SharedModules
})
export class LotComponent {
  @Input() lot: ILot | null = null;
  @Input() showControls: boolean = true;
  @Output() selected = new EventEmitter<void>();

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;
}
