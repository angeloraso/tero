import { NgModule } from '@angular/core';
import { AutoFocusDirective } from './autoFocus.directive';
import { OnlyNumberDirective } from './onlyNumbers.directive';
import { OnlyPhoneDigitsDirective } from './onlyPhoneDigits.directive';

const DIRECTIVES = [OnlyNumberDirective, AutoFocusDirective, OnlyPhoneDigitsDirective];
@NgModule({
  declarations: DIRECTIVES,
  exports: DIRECTIVES
})
export class DirectivesModule {}
