import { NgModule } from '@angular/core';
import { ConfirmFooterModule } from '@components/confirm-footer';
import { SharedModule } from '@shared/shared.module';
import { ShowHidePasswordComponent } from './show-hide-password.component';

@NgModule({
  imports: [SharedModule, ConfirmFooterModule],
  declarations: [ShowHidePasswordComponent],
  exports: [ShowHidePasswordComponent]
})
export class ShowHidePasswordModule {}
