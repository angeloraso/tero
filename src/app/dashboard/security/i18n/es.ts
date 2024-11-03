import { LANGUAGE } from '@bizy/services';

export const locale = {
  lang: LANGUAGE.SPANISH,
  translations: {
    SECURITY: {
      TITLE: 'Seguridad',
      INFO: {
        TITLE: 'Información',
        SECURITY_FEE: 'Costo total del servicio',
        MEMBERS: 'Vecinos integrantes',
        MEMBERSHIP_FEE: 'Valor de cuota'
      },
      STAFF: {
        TITLE: 'Personal'
      },
      GROUPS: {
        TITLE: 'Grupos',
        HISTORY: 'Historial',
        DEBT: 'Deudor',
        DEBT_POPUP: {
          TITLE: 'Registrar pago del grupo',
          MSG: 'El grupo dejará de mostrarse como deudor durante el resto del mes'
        }
      },
      SECURITY_INVOICES: {
        TITLE: 'Historial de pagos',
        CSV_FILE_NAME: 'tero_seguridad_historial_pagos.csv',
        DELETE_POPUP: {
          TITLE: 'Borrar registro de pago',
          MSG: 'Se borrará el siguiente registro de pago'
        }
      },
      REGISTER_PAYMENT_POPUP: {
        TITLE: 'Registrar pago de'
      },
      SECURITY_GROUP: {
        TITLE: 'Vecinos del Grupo',
        CSV_FILE_NAME: 'tero_vecinos_grupo_seguridad.csv',
        EMPTY: 'No hay vecinos para mostrar',
        DEBT: 'Deudor',
        TOTAL_CONTRIBUTORS: 'Total de contribuyentes',
        REGISTER_PAYMENT: 'Registrar pago',
        FILTER: {
          DEBT: {
            TITLE: 'Deuda',
            DEBT: 'Con deuda',
            NO_DEBT: 'Sin deuda'
          }
        }
      }
    }
  }
};
