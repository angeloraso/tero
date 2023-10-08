import { PATH as APP_PATH } from '@app/app.routing';
import { PATH as HOME_PATH } from '@home/home.routing';
import { IMenuOption } from '@menu/model';
import { PATH as SIDE_MENU_PATH } from '@menu/side-menu.routing';

export enum MENU_OPTION_ID {
  DASHBOARD = 'DASHBOARD',
  NEIGHBORHOOD = 'NEIGHBORHOOD'
}

export enum LANGUAGE {
  SPANISH = 'es'
}

export const ROOT_PATHS = [
  `/${APP_PATH.MENU}/${SIDE_MENU_PATH.HOME}/${HOME_PATH.NEIGHBORHOOD}`,
  `/${APP_PATH.MENU}/${SIDE_MENU_PATH.HOME}/${HOME_PATH.DASHBOARD}`,
  `/${APP_PATH.AUTH}`
];

export const DEFAULT_PICTURE = 'picture_user.svg';

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
