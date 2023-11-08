import { LANGUAGE } from '@core/constants';

export const locale = {
  lang: LANGUAGE.SPANISH,
  translations: {
    CORE: {
      EMPTY: 'Sin información',
      MENU: {
        DASHBOARD: 'Panel',
        NEIGHBORHOOD: 'Vecinos',
        MAP: 'Plano',
        CONTACTS: 'Contactos'
      },
      BUTTON: {
        CANCEL: 'Cancelar',
        SAVE: 'Guardar',
        CONFIRM: 'Confirmar'
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
          MIN: 'El valor debe ser mayor a ',
          MAX: 'El valor debe ser menor a ',
          EMAIL: 'Email inválido'
        }
      },
      TAG: {
        BLACKSMITH: 'Herrero',
        GARDENER: 'Jardinero',
        CARPENTER: 'Carpintero',
        MASON: 'Albañil',
        MASTER_BUILDER: 'Maestro mayor de obra',
        AIR_CONDITIONING: 'Aire acondicionado',
        ARCHITECT: 'Arquitecto',
        SOIL: 'Tierra',
        ELECTRICIAN: 'Electricista',
        GAS_FITTER: 'Gasista',
        PLUMBER: 'Plomero',
        INTERNET: 'Internet',
        SECURITY: 'Seguridad',
        MUNICIPALITY: 'Municipal',
        FOOD: 'Comida',
        DESSERT: 'Dulce',
        WIRE_FENCE: 'Alambrados',
        CEMENT_FENCE: 'Premoldeados',
        CONTAINERS: 'Contenedores',
        FREIGHT: 'Flete',
        PAINTER: 'Pintor',
        BANK: 'Banco'
      }
    }
  }
};
