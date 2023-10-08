import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LoadingComponent } from './loading/loading.component';
import { TitleComponent } from './title/title.component';

const COMPONENTS = [TitleComponent, LoadingComponent];
@NgModule({
  imports: [CommonModule],
  declarations: COMPONENTS,
  exports: COMPONENTS
})
export class ComponentsModule {}
