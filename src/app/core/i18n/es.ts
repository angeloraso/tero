import { LANGUAGE } from '@bizy/services';

export const locale = {
  lang: LANGUAGE.SPANISH,
  translations: {
    CORE: {
      EMPTY: 'Sin información',
      TOTAL: 'Total',
      MENU: {
        DASHBOARD: 'Panel',
        NEIGHBORHOOD: 'Barrio',
        NEIGHBORS: 'Vecinos',
        CONTACTS: 'Agenda',
        CONFIG: 'Config'
      },
      BUTTON: {
        CANCEL: 'Cancelar',
        SAVE: 'Guardar',
        CONFIRM: 'Confirmar',
        EXPORT: 'Exportar',
        CLEAN: 'Limpiar'
      },
      FORM: {
        FIELD: {
          LOT: 'Lote',
          SURNAME: 'Apellido',
          NAME: 'Nombre',
          GROUP: 'Grupo',
          SECURITY: 'Seguridad',
          EMAIL: 'Email',
          PASSWORD: 'Contraseña',
          SEARCH: 'Buscar',
          SCORE: 'Puntuación',
          COMMENTS: 'Comentarios',
          PHONE: 'Teléfono'
        },
        ERROR: {
          REQUIRED: 'Este campo es requerido',
          MIN: 'El valor debe ser mayor o igual a ',
          MAX: 'El valor debe ser menor o igual a ',
          EMAIL: 'Email inválido'
        }
      }
    }
  }
};
