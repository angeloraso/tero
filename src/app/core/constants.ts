import { PATH as APP_PATH } from '@app/app.routing';
import { PATH as HOME_PATH } from '@home/home.routing';

export enum MENU_OPTION_ID {
  DASHBOARD = 'DASHBOARD',
  NEIGHBORS = 'NEIGHBORS',
  NEIGHBORHOOD = 'NEIGHBORHOOD',
  CONTACTS = 'CONTACTS',
  CONFIG = 'CONFIG'
}

export const ROOT_PATHS = [
  `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORHOOD}`,
  `/${APP_PATH.HOME}/${HOME_PATH.DASHBOARD}`,
  `/${APP_PATH.HOME}/${HOME_PATH.NEIGHBORHOOD}`,
  `/${APP_PATH.HOME}/${HOME_PATH.CONTACTS}`,
  `/${APP_PATH.HOME}/${HOME_PATH.CONFIG}`,
  `/${APP_PATH.AUTH}`
];

export const LOGO_PATH = '/assets/favicons/favicon.ico';
export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 64;
export const LONG_TEXT_MAX_LENGTH = 256;
export const AVAILABLE_LOTS = 224;
export const AVAILABLE_SECURITY_GROUPS = [1, 2, 3, 4, 5, 6];
export const WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=549';

export const DEFAULT_USER_PICTURE = 'picture_user.svg';
