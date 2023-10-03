import { NgModule } from '@angular/core';
import { SharedModule } from '@shared/shared.module';
import { ConfirmFooterComponent } from './confirm-footer.component';

@NgModule({
  imports: [SharedModule],
  declarations: [ConfirmFooterComponent],
  exports: [ConfirmFooterComponent]
})
export class ConfirmFooterModule {}
