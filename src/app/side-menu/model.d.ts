import { MENU_OPTION_ID } from '@core/constants';

export interface IMenuOption {
  id: MENU_OPTION_ID;
  title: string;
  icon: string;
  active: boolean;
}
