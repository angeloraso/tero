import { LANGUAGE } from '@bizy/services';

export const locale = {
  lang: LANGUAGE.SPANISH,
  translations: {
    DASHBOARD: {
      TITLE: 'Panel',
      GARBAGE_TRUCK_POPUP: {
        TITLE: 'Camión de basura!',
        MSG: 'Avisar a los vecinos de Tero que el camión de basura esta pasando!'
      },
      GARBAGE_TRUCK_MSG: 'Gracias por avisar!',
      SECURITY: {
        TITLE: 'Seguridad',
        SECURITY_FEE: 'Costo total del servicio',
        MEMBERS: 'Vecinos integrantes',
        MEMBERSHIP_FEE: 'Valor de cuota',
        GROUP_DEBT_POPUP: {
          TITLE: 'Registrar pago del grupo',
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
