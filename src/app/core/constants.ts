import { PATH as APP_PATH } from '@app/app.routing';
import { PATH as HOME_PATH } from '@home/home.routing';
import { IContactTag } from './model';

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

export const AVAILABLE_LOTS = 224;
export const WHATSAPP_URL = 'https://api.whatsapp.com/send?phone=549';

export const DEFAULT_PICTURE = 'picture_user.svg';

export const TAGS: Array<IContactTag> = [
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
  { id: 'soil', value: 'CORE.TAG.SOIL', selected: false },
  { id: 'security', value: 'CORE.TAG.SECURITY', selected: false },
  { id: 'municipality', value: 'CORE.TAG.MUNICIPALITY', selected: false },
  { id: 'food', value: 'CORE.TAG.FOOD', selected: false },
  { id: 'dessert', value: 'CORE.TAG.DESSERT', selected: false },
  { id: 'wire-fence', value: 'CORE.TAG.WIRE_FENCE', selected: false },
  { id: 'cement-fence', value: 'CORE.TAG.CEMENT_FENCE', selected: false },
  { id: 'containers', value: 'CORE.TAG.CONTAINERS', selected: false },
  { id: 'freight', value: 'CORE.TAG.FREIGHT', selected: false },
  { id: 'painter', value: 'CORE.TAG.PAINTER', selected: false },
  { id: 'bank', value: 'CORE.TAG.BANK', selected: false }
];
