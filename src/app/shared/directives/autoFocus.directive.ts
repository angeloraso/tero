import {
  AfterViewInit,
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Inject,
  Input
} from '@angular/core';
import { Empty } from '@core/model';
import { fromEvent } from 'rxjs';
import { take } from 'rxjs/operators';

@Directive({
  selector: '[teroAutoFocus]'
})
export class AutoFocusDirective implements AfterViewInit {
  @Input() teroAutoFocus: boolean | Empty;

  constructor(
    @Inject(ElementRef) private elementRef: ElementRef,
    @Inject(ChangeDetectorRef) private ref: ChangeDetectorRef
  ) {}

  ngAfterViewInit() {
    if (
      typeof this.teroAutoFocus !== 'undefined' &&
      this.teroAutoFocus !== null &&
      this.teroAutoFocus !== false
    ) {
      this.setFocus();
    }
  }

  setFocus() {
    const interval = setInterval(() => {
      this.elementRef.nativeElement.focus();
      this.ref.detectChanges();
    }, 300);

    fromEvent(this.elementRef.nativeElement, 'focus')
      .pipe(take(1))
      .subscribe(() => {
        clearInterval(interval);
      });
  }
}
