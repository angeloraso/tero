import { LANGUAGE } from '@core/constants';

export const locale = {
  lang: LANGUAGE.SPANISH,
  translations: {
    CORE: {
      EMPTY: 'Sin elementos',
      MENU: {
        DASHBOARD: 'Panel',
        SECURITY: 'Seguridad'
      },
      BUTTON: {
        CANCEL: 'Cancelar',
        SAVE: 'Guardar',
        CONFIRM: 'Confirmar'
      },
      FORM: {
        FIELD: {
          DATE: 'Fecha',
          AMOUNT: 'Monto',
          BALANCE: 'Balance',
          EMAIL: 'Email',
          PASSWORD: 'Contraseña'
        },
        ERROR: {
          REQUIRED: 'Este campo es requerido',
          MIN: 'El valor debe ser mayor a ',
          EMAIL: 'Email inválido'
        }
      }
    }
  }
};
