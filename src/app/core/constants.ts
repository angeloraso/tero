import { PATH as APP_PATH } from '@app/app.routing';
import { PATH as HOME_PATH } from '@home/home.routing';
import { IMenuOption } from '@menu/model';
import { PATH as SIDE_MENU_PATH } from '@menu/side-menu.routing';
import { ITag } from './model';

export const AVAILABLE_LOTS = 224;
export const WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=549';

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

export const TAGS: Array<ITag> = [
  { id: 'air-conditioning', value: 'CORE.TAG.AIR_CONDITIONING', selected: false },
  { id: 'mason', value: 'CORE.TAG.MASON', selected: false },
  { id: 'architect', value: 'CORE.TAG.ARCHITECT', selected: false },
  { id: 'carpenter', value: 'CORE.TAG.CARPENTER', selected: false },
  { id: 'electrician', value: 'CORE.TAG.ELECTRICIAN', selected: false },
  { id: 'gas-fitter', value: 'CORE.TAG.GAS_FITTER', selected: false },
  { id: 'blacksmith', value: 'CORE.TAG.BLACKSMITH', selected: false },
  { id: 'internet', value: 'CORE.TAG.INTERNET', selected: false },
  { id: 'gardener', value: 'CORE.TAG.GARDENER', selected: false },
  { id: 'master-builder', value: 'CORE.TAG.MASTER_BUILDER', selected: false },
  { id: 'plumber', value: 'CORE.TAG.PLUMBER', selected: false },
  { id: 'soil', value: 'CORE.TAG.SOIL', selected: false }
];
