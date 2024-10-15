import { LANGUAGE } from '@bizy/services';

export const locale = {
  lang: LANGUAGE.SPANISH,
  translations: {
    CONFIG: {
      TITLE: 'Configuración',
      USERS: 'Usuarios',
      SIGN_OUT_POPUP: {
        TITLE: 'Cerrar sesión',
        MSG: 'Se cerrará la sesión de'
      },
      USER_STATUS: {
        ACTIVE: 'Activo',
        PENDING: 'Pendiente',
        SUSPENDED: 'Suspendido',
        REJECTED: 'Rechazado'
      },
      PENDING_USERS: {
        TITLE: 'Solicitudes de vecinos',
        ACCEPT_POPUP: {
          TITLE: 'Aceptar solicitud',
          MSG: 'Se incorporará al vecino/a al barrio y podrá visualizar información sensible'
        },
        REJECT_POPUP: {
          TITLE: 'Rechazar solicitud',
          MSG: 'No se incorporará el vecino/a al barrio y se eliminará de la lista de solicitudes pendientes'
        }
      }
    }
  }
};
