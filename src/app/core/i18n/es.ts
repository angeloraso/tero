import { LANGUAGE } from '@bizy/services';

export const locale = {
  lang: LANGUAGE.SPANISH,
  translations: {
    CORE: {
      EMPTY: 'Sin información',
      TOTAL: 'Total',
      YES: 'Si',
      No: 'No',
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
        CLEAN: 'Limpiar',
        ACCEPT: 'Aceptar',
        REJECT: 'Rechazar'
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
          COMMENTS: 'Comentarios',
          PHONE: 'Teléfono',
          DESCRIPTION: 'Descripción',
          TAG: 'Categoría'
        },
        ERROR: {
          REQUIRED: 'Este campo es requerido',
          MIN: 'El valor debe ser mayor o igual a ',
          MAX: 'El valor debe ser menor o igual a ',
          EMAIL: 'Email inválido',
          PHONE: 'Teléfono inválido',
          APP: 'No posee una aplicación para leer el archivo',
          SHARE: 'El dispositivo no permite compartir la información'
        }
      }
    }
  }
};
