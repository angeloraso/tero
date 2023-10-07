import { LANGUAGE } from '@core/constants';

export const locale = {
  lang: LANGUAGE.SPANISH,
  translations: {
    CORE: {
      EMPTY: 'Sin elementos',
      MENU: {
        DASHBOARD: 'Panel',
        NEIGHBORHOOD: 'Vecinos'
      },
      BUTTON: {
        CANCEL: 'Cancelar',
        SAVE: 'Guardar',
        CONFIRM: 'Confirmar'
      },
      FORM: {
        FIELD: {
          LOT: 'Lote',
          SURNAME: 'Apellido',
          NAME: 'Nombre',
          GROUP: 'Grupo',
          SECURITY: 'Seguridad',
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
