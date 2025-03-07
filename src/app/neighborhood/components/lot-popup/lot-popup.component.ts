import { Component, inject } from '@angular/core';
import { SharedModules } from '@app/shared';
import {
  BIZY_TAG_TYPE,
  BizyCopyToClipboardService,
  BizyLogService,
  BizyPopupService,
  BizyToastService,
  BizyTranslateService
} from '@bizy/core';
import { ILot } from '@neighborhood/neighborhood.model';

@Component({
    selector: 'tero-lot-popup',
    templateUrl: './lot-popup.html',
    styleUrls: ['./lot-popup.css'],
    imports: SharedModules
})
export class LotPopupComponent {
  readonly #popup = inject(BizyPopupService);
  readonly #clipboard = inject(BizyCopyToClipboardService);
  readonly #translate = inject(BizyTranslateService);
  readonly #toast = inject(BizyToastService);
  readonly #log = inject(BizyLogService);
  data: ILot = this.#popup.getData<ILot>();

  readonly BIZY_TAG_TYPE = BIZY_TAG_TYPE;

  async copyLotData() {
    try {
      await this.#clipboard
        .copy(`${this.#translate.get('NEIGHBORHOOD.DATA.DISTRICT')}: ${this.data.district}
${this.#translate.get('NEIGHBORHOOD.DATA.CADASTRAL_JURISDICTION')}: ${this.data.cadastralJurisdiction}
${this.#translate.get('NEIGHBORHOOD.DATA.SECTION')}: ${this.data.section}
${this.#translate.get('NEIGHBORHOOD.DATA.SUBDIVISION')}: ${this.data.subdivision}
${this.#translate.get('NEIGHBORHOOD.DATA.BLOCK')}: ${this.data.block}
${this.#translate.get('NEIGHBORHOOD.DATA.PARCEL')}: ${this.data.parcel}
${this.#translate.get('NEIGHBORHOOD.DATA.CADASTRAL_NUMBER')}: ${this.data.cadastralNumber}`);
      this.#toast.success();
    } catch (error) {
      this.#log.error({
        fileName: 'lot-popup.component',
        functionName: 'copyLotData',
        param: error
      });
      this.#toast.danger();
    }
  }
}
