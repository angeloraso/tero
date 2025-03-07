import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BizyAnimationService, BizyAveragePipe, BizyButtonComponent, BizyCacheService, BizyCalendarComponent, BizyCardComponent, BizyCopyToClipboardService, BizyEnumToArrayPipe, BizyExportToCSVService, BizyFilterComponent, BizyFilterPipe, BizyFilterSectionCheckboxOptionComponent, BizyFilterSectionComponent, BizyFilterSectionSearchOptionComponent, BizyFormComponent, BizyGridComponent, BizyGridForDirective, BizyInputComponent, BizyInputOptionComponent, BizyKeyboardService, BizyListComponent, BizyLoadingDirective, BizyLogService, BizyMenuComponent, BizyMenuOptionComponent, BizyMenuTitleComponent, BizyOrderByPipe, BizyPopupService, BizyPopupWrapperComponent, BizyRepeatPipe, BizyRouterService, BizySearchPipe, BizySelectComponent, BizySelectOptionComponent, BizySkeletonComponent, BizyStorageService, BizyTableColumnArrowsComponent, BizyTableColumnComponent, BizyTableColumnFixedDirective, BizyTableComponent, BizyTableHeaderComponent, BizyTableRowComponent, BizyTableScrollingDirective, BizyTagComponent, BizyToastService, BizyToastWrapperComponent, BizyToggleComponent, BizyToolbarComponent, BizyTooltipDirective, BizyUserAgentService, BizyValidatorService, BizyViewportService } from '@bizy/core';
import { TranslateDirective, TranslatePipe } from "@ngx-translate/core";

const ANGULAR = [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
];

const BIZY_COMPONENTS = [
    BizyCardComponent,
    BizyButtonComponent,
    BizyTagComponent,
    BizyToolbarComponent,
    BizyInputComponent,
    BizyInputOptionComponent,
    BizySkeletonComponent,
    BizyMenuComponent,
    BizyMenuTitleComponent,
    BizyMenuOptionComponent,
    BizyGridComponent,
    BizyFilterComponent,
    BizyFilterSectionComponent,
    BizyFilterSectionCheckboxOptionComponent,
    BizyFilterSectionSearchOptionComponent,
    BizyFormComponent,
    BizySelectComponent,
    BizySelectOptionComponent,
    BizyToggleComponent,
    BizyListComponent,
    BizyTableComponent,
    BizyTableHeaderComponent,
    BizyTableColumnArrowsComponent,
    BizyTableColumnComponent,
    BizyTableRowComponent,
    BizyCalendarComponent,
    BizyPopupWrapperComponent,
    BizyToastWrapperComponent
];

const BIZY_DIRECTIVES = [
    BizyLoadingDirective,
    BizyTooltipDirective,
    BizyTableColumnFixedDirective,
    TranslateDirective,
    BizyGridForDirective,
    BizyTableScrollingDirective
];

export const BIZY_PIPES = [
    TranslatePipe,
    BizySearchPipe,
    BizyFilterPipe,
    BizyOrderByPipe,
    BizyEnumToArrayPipe,
    BizyRepeatPipe,
    BizyAveragePipe
];

export const BIZY_SERVICES = [
    BizyAnimationService,
    BizyViewportService,
    BizyKeyboardService,
    BizyExportToCSVService,
    BizyCacheService,
    BizyUserAgentService,
    BizyValidatorService,
    BizyStorageService,
    BizyLogService,
    BizyRouterService,
    BizyCopyToClipboardService,
    BizyPopupService,
    BizyToastService
];

export const SharedModules = [...ANGULAR, ...BIZY_COMPONENTS, ...BIZY_DIRECTIVES, ...BIZY_PIPES];

