import { LANGUAGE } from '@bizy/services';

export const locale = {
  lang: LANGUAGE.SPANISH,
  translations: {
    NEIGHBORS: {
      TITLE: 'Vecinos',
      EMPTY: 'Sin información. Quizá se deba a un problema de permisos',
      CSV_FILE_NAME: 'tero_vecinos.csv',
      NO_GROUP: 'Sin grupo',
      NO_ALARM: 'Sin alarma',
      NO_CONTROL: 'Sin control',
      CONTROL: 'Con control',
      SECURITY: {
        TITLE: 'Dar de baja',
        MSG: 'Se dará de baja del servicio de seguridad al vecino/a'
      },
      ADD_NEIGHBOR: {
        TITLE: 'Agregar vecino'
      },
      EDIT_NEIGHBOR: {
        TITLE: 'Editar vecino',
        DELETE_POPUP: {
          TITLE: 'Borrar vecino/a',
          MSG: 'Se borrará el vecino/a'
        }
      }
    }
  }
};
