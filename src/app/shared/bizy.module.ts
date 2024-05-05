import { NgModule } from '@angular/core';
import {
  BizyBarChartModule,
  BizyButtonModule,
  BizyCardModule,
  BizyConfirmButtonsModule,
  BizyErrorModule,
  BizyFabButtonModule,
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
import { BizyPopupModule, BizyToastModule, BizyTranslatePipeModule } from '@bizy/services';

@NgModule({
  exports: [
    BizyVirtualScrollModule,
    BizyDirectivesModule,
    BizyPipesModule,
    BizyPopupModule,
    BizyToastModule,
    BizyButtonModule,
    BizyFabButtonModule,
    BizyConfirmButtonsModule,
    BizyToggleModule,
    BizyInputModule,
    BizyErrorModule,
    BizyConfirmButtonsModule,
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
