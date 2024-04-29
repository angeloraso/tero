import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { BizyModule } from '@shared/bizy.module';
import { PopupComponent } from './popup/popup.component';

const COMPONENTS = [PopupComponent];
@NgModule({
  imports: [CommonModule, BizyModule],
  declarations: COMPONENTS,
  exports: COMPONENTS
})
export class ComponentsModule {}
