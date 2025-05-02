import { LANGUAGE } from '@bizy/core';

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
      MONTH: {
        MAIN: 'Mes',
        JANUARY: 'Enero',
        FEBRUARY: 'Febrero',
        MARCH: 'Marzo',
        APRIL: 'Abril',
        MAY: 'Mayo',
        JUNE: 'Junio',
        JULY: 'Julio',
        AUGUST: 'Agosto',
        SEPTEMBER: 'Septiembre',
        OCTOBER: 'Octubre',
        NOVEMBER: 'Noviembre',
        DECEMBER: 'Diciembre'
      },
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
          ALIAS_CBU: 'Alias/CBU',
          ALARM_NUMBER: 'Alarma',
          NO_ALARM_NUMBER: 'Sin alarma',
          ALARM_CONTROL: 'Control',
          ALARM_CONTROLS: 'Controles',
          NO_ALARM_CONTROLS: 'Sin controles',
          SURNAME: 'Apellido',
          NAME: 'Nombre',
          SECURITY: 'Seguridad',
          EMAIL: 'Email',
          PASSWORD: 'Contraseña',
          SEARCH: 'Buscar',
          COMMENTS: 'Comentarios',
          PHONE: 'Teléfono',
          DESCRIPTION: 'Descripción',
          TAG: 'Categoría',
          NO_TAG: 'Sin categorías',
          PRICE: 'Precio',
          STATE: 'Estado',
          ROLE: 'Rol',
          TRANSACTION_ID: 'Identificador de pago (recomendado)',
          TITLE: 'Título',
          DATA_TYPE: 'Tipo de información',
          VALUE: 'Valor',
          ADMIN: 'Administrador',
          GROUP: 'Grupo',
          NO_GROUP: 'Sin grupo',
          SECURITY_GROUP: 'Grupo de seguridad',
          SELECTED: 'Seleccionados',
          PARTNERS: 'Colaboradores',
          NO_PARTNERS: 'Sin colaboradores'
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
      },
      ERROR: {
        NOTIFICATION_PERMISSIONS: 'Debe dar permisos de notificación'
      }
    }
  }
};
