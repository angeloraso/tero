import { PATH as APP_PATH } from '@app/app.routing';
import { PATH as HOME_PATH } from '@home/home.routing';
import { IMenuOption } from '@menu/model';
import { PATH as SIDE_MENU_PATH } from '@menu/side-menu.routing';

export const AVAILABLE_LOTS = 224;

export enum MENU_OPTION_ID {
  DASHBOARD = 'DASHBOARD',
  NEIGHBORHOOD = 'NEIGHBORHOOD',
  MAP = 'MAP',
  CONTACTS = 'CONTACTS'
}

export enum LANGUAGE {
  SPANISH = 'es'
}

export const ROOT_PATHS = [
  `/${APP_PATH.MENU}/${SIDE_MENU_PATH.HOME}/${HOME_PATH.NEIGHBORHOOD}`,
  `/${APP_PATH.MENU}/${SIDE_MENU_PATH.HOME}/${HOME_PATH.DASHBOARD}`,
  `/${APP_PATH.MENU}/${SIDE_MENU_PATH.HOME}/${HOME_PATH.MAP}`,
  `/${APP_PATH.MENU}/${SIDE_MENU_PATH.HOME}/${HOME_PATH.CONTACTS}`,
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
  },
  {
    id: MENU_OPTION_ID.MAP,
    title: 'CORE.MENU.MAP',
    icon: 'map',
    active: false
  },
  {
    id: MENU_OPTION_ID.CONTACTS,
    title: 'CORE.MENU.CONTACTS',
    icon: 'contacts',
    active: false
  }
];
