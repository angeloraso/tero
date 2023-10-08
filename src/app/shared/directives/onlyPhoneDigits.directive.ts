import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[teroOnlyPhoneDigits]'
})
export class OnlyPhoneDigitsDirective {
  regexStr = '^[0-9*#+]*$';

  @HostListener('keydown', ['$event']) onKeyDown(event: KeyboardEvent) {
    const e = <KeyboardEvent>event;
    const ignore = [
      'Backspace',
      'backspace',
      'delete',
      'Delete',
      'Tab',
      'tab',
      'Escape',
      'escape',
      'Enter',
      'enter',
      'Subtract',
      'subtract'
    ];
    if (
      ignore.indexOf(e.key) !== -1 ||
      e.ctrlKey ||
      e.metaKey ||
      // Allow: home, end, left, right
      (e.keyCode >= 35 && e.keyCode <= 39)
    ) {
      // Let it happen, don't do anything
      return;
    }

    const regEx = new RegExp(this.regexStr);
    if (!regEx.test(e.key)) {
      e.preventDefault();
    }
  }
}
