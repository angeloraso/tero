import { NgModule } from '@angular/core';
import {
  BizyBarChartModule,
  BizyButtonModule,
  BizyCardModule,
  BizyFilterModule,
  BizyInputModule,
  BizyLineChartModule,
  BizySelectModule,
  BizySidebarModule,
  BizyTableModule,
  BizyTabsModule,
  BizyTagModule,
  BizyToggleModule,
  BizyToolbarModule,
  BizyVirtualScrollModule
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
    BizyVirtualScrollModule,
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
    BizyLineChartModule,
    BizyBarChartModule,
    BizyFilterModule,
    BizyTagModule,
    BizyCardModule
  ]
})
export class BizyModule {}
