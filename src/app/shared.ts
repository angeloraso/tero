import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  BizyButtonModule,
  BizyCalendarModule,
  BizyCardModule,
  BizyCheckboxModule,
  BizyContentModule,
  BizyDirectivesModule,
  BizyFilterModule,
  BizyFormModule,
  BizyGridModule,
  BizyInputModule,
  BizyListModule,
  BizyMenuModule,
  BizyPipesModule,
  BizyPopupModule,
  BizyRadioModule,
  BizySectionModule,
  BizySelectModule,
  BizyServicesModule,
  BizySkeletonModule,
  BizyTableModule,
  BizyTagModule,
  BizyTimelineModule,
  BizyToastModule,
  BizyToggleModule,
  BizyToolbarModule,
  BizyTranslateModule
} from '@bizy/core';

const ANGULAR = [CommonModule, FormsModule, ReactiveFormsModule];

const BIZY_MODULES = [
  BizyPopupModule,
  BizyToastModule,
  BizyTranslateModule,
  BizyPipesModule,
  BizyDirectivesModule,
  BizyServicesModule,
  BizyCardModule,
  BizyButtonModule,
  BizyTagModule,
  BizyToolbarModule,
  BizyInputModule,
  BizySkeletonModule,
  BizyMenuModule,
  BizyGridModule,
  BizyFilterModule,
  BizyFormModule,
  BizySelectModule,
  BizyToggleModule,
  BizyListModule,
  BizyTableModule,
  BizyCalendarModule,
  BizySectionModule,
  BizyRadioModule,
  BizyCheckboxModule,
  BizyTimelineModule,
  BizyContentModule
];

export const SharedModules = [...ANGULAR, ...BIZY_MODULES];
