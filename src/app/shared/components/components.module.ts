import { NgModule } from '@angular/core';
import { TitleComponent } from './title/title.component';

const COMPONENTS = [TitleComponent];
@NgModule({
  declarations: COMPONENTS,
  exports: COMPONENTS
})
export class ComponentsModule {}
