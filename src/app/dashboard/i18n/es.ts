import { LANGUAGE } from '@bizy/core';

export const locale = {
  lang: LANGUAGE.SPANISH,
  translations: {
    DASHBOARD: {
      TITLE: 'Panel',
      GARBAGE_TRUCK_POPUP: {
        TITLE: 'Camión de basura!',
        MSG: 'Avisar a los vecinos de Tero que el camión de basura esta pasando!'
      },
      GARBAGE_NOTIFICATION: {
        TITLE: 'Camión de basura!',
        BODY: 'El camión de basura esta pasando!'
      },
      GARBAGE_TRUCK_MSG: 'Gracias por avisar!',
      SECURITY: {
        TITLE: 'Seguridad',
        SECURITY_FEE: 'Costo del servicio',
        MEMBERS: 'Vecinos integrantes',
        GROUP_DEBT_POPUP: {
          TITLE: 'Registrar pago',
          MSG: 'El grupo dejará de mostrarse como deudor durante el resto del mes'
        }
      },
      ECOMMERCE: {
        TITLE: 'Tienda Tero',
        PRODUCTS_FOR_SALE: 'productos a la venta'
      },
      TOPICS: {
        TITLE: 'Temario',
        OPEN_TOPICS: 'temas en curso'
      }
    }
  }
};
