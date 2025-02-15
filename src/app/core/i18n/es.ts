import { LANGUAGE } from '@bizy/services';

export const locale = {
  lang: LANGUAGE.SPANISH,
  translations: {
    CORE: {
      EMPTY: 'Sin información',
      NO_MATCHES: 'Sin coincidencias',
      TOTAL: 'Total',
      YES: 'Si',
      NO: 'No',
      MORE_INFO: 'Más info',
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
        REJECT: 'Rechazar',
        ORDER_BY: 'Ordenar por'
      },
      FORM: {
        FIELD: {
          DATE: 'Fecha',
          LOT: 'Lote',
          ALARM_NUMBER: 'Alarma',
          ALARM_CONTROLS: 'Controles',
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
          TAG: 'Categoría',
          PRICE: 'Precio',
          STATE: 'Estado',
          ROLE: 'Rol',
          TRANSACTION_ID: 'Identificador de pago (recomendado)',
          TITLE: 'Título',
          DATA_TYPE: 'Tipo de información',
          VALUE: 'Valor'
        },
        ERROR: {
          REQUIRED: 'Este campo es requerido',
          MIN: 'El valor debe ser mayor o igual a ',
          MAX: 'El valor debe ser menor o igual a ',
          MAX_LENGTH: 'Máxima cantidad de caracteres',
          MIN_LENGTH: 'Mínima cantidad de caracteres',
          EMAIL: 'Email inválido',
          PHONE: 'Teléfono inválido',
          APP: 'No posee una aplicación para leer el archivo',
          SHARE: 'El dispositivo no permite compartir la información'
        }
      },
      USER_STATE: {
        ACTIVE: 'Activo',
        PENDING: 'Pendiente',
        SUSPENDED: 'Suspendido',
        REJECTED: 'Rechazado'
      },
      USER_ROLE: {
        NEIGHBOR: 'Vecino/a',
        ADMIN: 'Admin',
        SECURITY: 'Seguridad',
        CONFIG: 'Super usuario',
        SECURITY_GROUP_1: 'Admin de Grupo 1',
        SECURITY_GROUP_2: 'Admin de Grupo 2',
        SECURITY_GROUP_3: 'Admin de Grupo 3',
        SECURITY_GROUP_4: 'Admin de Grupo 4',
        SECURITY_GROUP_5: 'Admin de Grupo 5',
        SECURITY_GROUP_6: 'Admin de Grupo 6'
      },
      TOPIC_STATE: {
        ACTIVE: 'Activo',
        STOPPED: 'En pausa',
        CLOSED: 'Cerrado'
      },
      TOPIC_DATA_TYPE: {
        DATA: 'Dato',
        TEL: 'Teléfono',
        LINK: 'Link',
        EMAIL: 'Email',
        NUMBER: 'Número'
      }
    }
  }
};
