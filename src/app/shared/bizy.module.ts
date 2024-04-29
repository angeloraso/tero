import { NgModule } from '@angular/core';
import {
  BizyBarChartModule,
  BizyButtonModule,
  BizyConfirmButtonsModule,
  BizyErrorModule,
  BizyFabButtonModule,
  BizyInputModule,
  BizyLineChartModule,
  BizySelectModule,
  BizySidebarModule,
  BizyTableModule,
  BizyTabsModule,
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
    BizyBarChartModule
  ]
})
export class BizyModule {}
