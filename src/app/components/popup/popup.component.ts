import { Component, inject, OnInit } from '@angular/core';
import {
  BizyButtonComponent,
  BizyListModule,
  BizyPopupService,
  BizySectionCenterComponent,
  BizySectionComponent,
  BizyTranslatePipe
} from '@bizy/core';
@Component({
  selector: 'tero-popup',
  templateUrl: 'popup.html',
  styleUrls: ['popup.css'],
  imports: [BizyButtonComponent, BizyTranslatePipe, BizyListModule, BizySectionComponent, BizySectionCenterComponent]
})
export class PopupComponent implements OnInit {
  readonly #popup = inject(BizyPopupService);
  title: string = '';
  msg: string = '';

  ngOnInit() {
    const data = this.#popup.getData<{ title: string; msg: string }>();
    this.title = data.title;
    this.msg = data.msg;
  }

  close() {
    this.#popup.close();
  }

  apply() {
    this.#popup.close({ response: true });
  }
}
