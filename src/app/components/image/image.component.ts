import { Component, Input } from '@angular/core';
import { DEFAULT_USER_PICTURE } from '@core/constants';

@Component({
  selector: 'tero-img',
  template: '<img [height]="height" [src]="_src" [alt]="alt" />'
})
export class ImageComponent {
  @Input() height: number = 70;
  @Input() alt: string = 'image';

  private readonly ASSETS_PATH = '/assets/img/';

  _src: string = `${this.ASSETS_PATH}${DEFAULT_USER_PICTURE}`;

  @Input() set src(src: string) {
    if (!src) {
      this._src = `${this.ASSETS_PATH}${DEFAULT_USER_PICTURE}`;
      return;
    }

    this._src = `${this.ASSETS_PATH}${src}`;
  }
}
