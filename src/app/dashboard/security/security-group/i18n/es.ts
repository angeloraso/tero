import { LANGUAGE } from '@bizy/core';

export const locale = {
  lang: LANGUAGE.SPANISH,
  translations: {
    SECURITY_GROUP: {
      TITLE: 'Vecinos del Grupo',
      CSV_FILE_NAME: 'tero_vecinos_grupo_seguridad.csv',
      EMPTY: 'No hay vecinos para mostrar',
      DEBT: 'Deudor',
      TOTAL_CONTRIBUTORS: 'Total de contribuyentes',
      REGISTER_PAYMENT: 'Registrar pago',
      DELETE_POPUP: {
        TITLE: 'Borrar registro de pago',
        MSG: 'Se borrará el siguiente registro de pago'
      },
      FILTER: {
        DEBT: {
          TITLE: 'Deuda',
          DEBT: 'Con deuda',
          NO_DEBT: 'Sin deuda'
        }
      },
      USER_INVOICE_NOTIFICATION: {
        TITLE: 'Registración de pago',
        BODY: 'Se registró su pago de seguridad'
      },
      SECURITY_GROUP_INVOICES: {
        TITLE: 'Historial de pagos'
      }
    }
  }
};
