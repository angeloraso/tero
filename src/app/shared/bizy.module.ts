import { NgModule } from '@angular/core';
import {
  BizyButtonModule,
  BizyCalendarModule,
  BizyCardModule,
  BizyFilterModule,
  BizyFormModule,
  BizyGridModule,
  BizyInputModule,
  BizyMenuModule,
  BizySelectModule,
  BizySidebarModule,
  BizySkeletonCardModule,
  BizyTableModule,
  BizyTabsModule,
  BizyTagModule,
  BizyToggleModule,
  BizyToolbarModule
} from '@bizy/components';
import { BizyDirectivesModule } from '@bizy/directives';
import { BizyPipesModule } from '@bizy/pipes';
import {
  BizyCopyToClipboardModule,
  BizyPopupModule,
  BizyToastModule,
  BizyTranslatePipeModule
} from '@bizy/services';

@NgModule({
  exports: [
    BizyDirectivesModule,
    BizyPipesModule,
    BizyPopupModule,
    BizyCopyToClipboardModule,
    BizyToastModule,
    BizyButtonModule,
    BizyToggleModule,
    BizyInputModule,
    BizyTabsModule,
    BizyToolbarModule,
    BizySidebarModule,
    BizyTableModule,
    BizySelectModule,
    BizyTranslatePipeModule,
    BizyFilterModule,
    BizyTagModule,
    BizyCardModule,
    BizyFormModule,
    BizyGridModule,
    BizySkeletonCardModule,
    BizyMenuModule,
    BizyCalendarModule
  ]
})
export class BizyModule {}
