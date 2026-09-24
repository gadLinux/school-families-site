/**
 * Registro de cambios de la web, del más reciente al más antiguo. La portada
 * muestra los dos primeros. Cada versión separa lo añadido, lo modificado, lo
 * verificado y, sobre todo, las correcciones de datos: si una cifra publicada
 * estaba mal, aquí se dice cuál, por qué y qué la sustituye.
 */
export interface Version {
  /** Fecha de publicación, en texto. */
  fecha: string;
  /** Commit desplegado, si se conoce. */
  commit?: string;
  resumen: string;
  anadido: string[];
  modificado: string[];
  verificaciones: string[];
  correcciones: string[];
}

export const versiones: Version[] = [
  {
    fecha: '24 de septiembre de 2026',
    resumen: 'Nuevas cifras oficiales de la Comunidad de Madrid, la página de datos ordenada por temas y cada CSV con su procedencia.',
    anadido: [
      'Ocho gráficos en [Datos](/datos): [aptos en la PAU, cifra oficial frente a la del centro](/datos#aptos-oficial), [titulación en Bachillerato](/datos#titulacion-bach), [alumnos en 1.º y 2.º de Bachillerato](/datos#piramide-bach), [solicitudes de plaza](/datos#admision-bach), [nota de Bachillerato frente a nota de la PAU](/datos#expediente-pau), [quién pasa de curso en 2.º de ESO](/datos#embudo-2eso), [alumnos en el curso que les corresponde por edad](/datos#idoneidad) y [suspensos por materia y grupo](/datos#materias-grupo).',
      'Dos fuentes oficiales: más series del buscador de centros de la Comunidad de Madrid y las tasas de idoneidad de su Estadística de la Enseñanza.',
      'Junto a cada CSV, su ficha de procedencia descargable (documento, página, dirección y fecha de cada fuente) y cuántas veces se ha cotejado con el original.',
    ],
    modificado: [
      'La página de datos se divide en tres secciones: Bachillerato y PAU, promoción y repetición en la ESO, y 2.º de ESO grupo a grupo.',
      'El gráfico por grupos de 2.º de ESO incluye también la 1.ª evaluación.',
      '«Datos que faltan» se ordena por temas, e incluye las horas de clase sin profesor y los apoyos al alumnado.',
    ],
    verificaciones: [
      'De los 14 CSV publicados, 9 se han cotejado enteros con su fuente original, 3 en parte y 2 están pendientes. Cada gráfico indica el estado de sus datos.',
      'Dos casillas de Lengua (2.º D y 2.º E, evaluación final) que estaban en blanco se han completado leyendo las actas. Cada fila se ha comprobado sumando las calificaciones hasta el total de alumnos del grupo.',
    ],
    correcciones: [
      'Nota media en la PAU: decíamos que ninguna fuente aclaraba la diferencia entre la cifra del centro y la oficial. El gráfico del propio centro indica que, desde 2018-19, esa nota la calcula el centro. Corregido.',
      'Media regional de aptos anterior a 2018-19: es la que publica el centro y no la hemos podido comprobar; ahora se dibuja discontinua. Las dos veces que se ha podido cotejar, la cifra del centro era más alta que la oficial.',
      'Grupos de 2.º de ESO: decíamos «mismo curso y mismo currículo». No es exacto: según las actas, 2.º A y 2.º B reúnen a la sección de francés y no tienen Refuerzo de Matemáticas.',
      'Promoción en 2.º de ESO: la comparábamos con 2014-15, de una serie que no incluía la evaluación extraordinaria. Ahora se compara solo con la serie comparable, desde 2015-16.',
      'Aptos en la PAU frente a la media regional en 2025-26: se añade que, con el mismo denominador (aptos sobre presentados), la diferencia es de 2,0 puntos y no de 2,37.',
      '«¿Quién llega a la PAU?»: donde decía «Sobre todo el alumnado», que podía leerse como «principalmente», ahora dice «Sobre el total del alumnado».',
    ],
  },
  {
    fecha: '23 de septiembre de 2026',
    commit: 'b556e6e',
    resumen: 'Primera versión pública de la página de datos y estadísticas de visitas sin cookies.',
    anadido: [
      'Página de [Datos](/datos) con cinco gráficos (PAU, titulación y promoción), su fuente con la página exacta y los CSV para descargar.',
      'Estadísticas de visitas con Matomo, sin cookies.',
      'Explicación de los votos y versión de la web en el pie de página.',
    ],
    modificado: [],
    verificaciones: ['Cada cifra enlaza a su documento original, con la página donde aparece.'],
    correcciones: [
      'El 99,63 % de presentados que publica la Comunidad de Madrid se refiere a quienes se matricularon en la PAU, no al alumnado de 2.º de Bachillerato. Ya no se compara con el centro.',
      'El 95,16 % de aptos de la Comunidad de Madrid es de la PAU de 2025, no de la de 2026 (94,73 %).',
      'Se descartaron las estimaciones de alumnos de 2.º de Bachillerato hechas a partir de los grupos: eran incompatibles con el requisito del título para presentarse a la PAU. Se sustituyeron por mínimos calculados solo con cifras del centro.',
      'En la circular del centro de octubre de 2024, el «31» era la carga lectiva semanal, no el número de alumnos por grupo.',
    ],
  },
];
