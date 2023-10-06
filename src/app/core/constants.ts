import { IMenuOption } from '@menu/model';

export enum MENU_OPTION_ID {
  DASHBOARD = 'DASHBOARD',
  NEIGHBORHOOD = 'NEIGHBORHOOD'
}

export enum LANGUAGE {
  SPANISH = 'es'
}

export const DEFAULT_PICTURE = 'picture_male.svg';

export const MENU_OPTIONS: Array<IMenuOption> = [
  {
    id: MENU_OPTION_ID.NEIGHBORHOOD,
    title: 'CORE.MENU.NEIGHBORHOOD',
    icon: 'diversity_3',
    active: false
  },
  {
    id: MENU_OPTION_ID.DASHBOARD,
    title: 'CORE.MENU.DASHBOARD',
    icon: 'dashboard',
    active: false
  }
];
