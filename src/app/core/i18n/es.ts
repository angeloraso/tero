import { LANGUAGE } from '@core/constants';

export const locale = {
  lang: LANGUAGE.SPANISH,
  translations: {
    CORE: {
      EMPTY: 'Sin información',
      MENU: {
        DASHBOARD: 'Panel',
        NEIGHBORHOOD: 'Vecinos',
        MAP: 'Plano'
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
          MAX: 'El valor debe ser menor a ',
          EMAIL: 'Email inválido'
        }
      }
    }
  }
};
