// Experiencias publicadas. Cada una se añade solo tras pasar la moderación:
// sin nombres ni datos que identifiquen a nadie, hechos que podamos sostener y
// opiniones presentadas como opiniones (ver «Publishing stories» en README.md).
// En la fase 3 vendrán de PocketBase.
import type { CategoriaId, EtapaId } from './categorias';

export interface Experiencia {
  slug: string;
  titulo: string;
  extracto: string;
  cuerpo: string[]; // párrafos
  seudonimo: string;
  categoria: CategoriaId;
  etapa: EtapaId;
  curso: string;
  publicada: string; // ISO
  adjuntos: number;
  comentarios: number;
  aMiTambien: number; // recuento de partida: siempre 0, el real viene de PocketBase
  votosArriba: number;
  votosAbajo: number;
}

/** Seudónimo de las experiencias de la familia que mantiene la web. */
const OWNER = 'Owner';

const nueva = {
  seudonimo: OWNER,
  curso: '2025-2026',
  publicada: '2026-09-22T16:00',
  adjuntos: 0,
  comentarios: 0,
  aMiTambien: 0,
  votosArriba: 0,
  votosAbajo: 0,
};

export const experiencias: Experiencia[] = [
  {
    ...nueva,
    slug: 'repetir-sin-la-votacion-que-exige-la-ley',
    publicada: '2026-09-22T16:50',
    titulo: 'Nuestra hija repitió sin la votación que exige la ley',
    extracto:
      'Para decidir una repetición, la norma exige dos tercios del equipo docente y que conste en el acta. El acta solo dice «por consenso». La Administración lo reconoció y aun así dio la decisión por buena.',
    cuerpo: [
      'A nuestra hija le hicieron repetir 2.º de ESO. Reclamamos y el equipo docente se reunió de nuevo para revisar la decisión.',
      'La norma de la Comunidad de Madrid es clara: las decisiones sobre la promoción «se adoptarán por mayoría cualificada de dos tercios, previa deliberación, de la que se dejará constancia en el acta» (Orden 1712/2023, art. 26.3). El consenso vale para las demás decisiones del equipo docente, pero la misma orden excluye expresamente «las referentes a la promoción y a la titulación» (art. 20.3).',
      'En el acta de esa reunión no hay ninguna votación. Cada profesor puso una nota de 1 a 10 a cada competencia, se hizo la media y el acta dice que el equipo docente «resuelve por consenso» mantener la repetición.',
      '![Extractos del acta de la reunión del equipo docente. Los datos personales los hemos tapado nosotros.](/documentos/acta-junta-evaluacion-extraordinaria-extracto.png)',
      'Reclamamos ante la Dirección de Área Territorial, que lo comprobó. Su resolución lo reconoce por escrito: «aunque no consta que se haya producido una votación», y admite que «la normativa expresa que las decisiones relativas a la promoción de los alumnos deben tomarse por mayoría de 2/3». Aun así, concluyó que «no se considera que este defecto suponga una indefensión» y mantuvo la repetición.',
      'Para nosotros es grave: una decisión que cambia un curso entero de la vida de una alumna se tomó sin el requisito que marca la ley, y quien debía vigilarlo lo dio por bueno. ¿Basta un «consenso» cuando la norma pide dos tercios y que conste en el acta? Si en tu familia se decidió una repetición, ¿te enseñaron cómo se votó?',
    ],
    categoria: 'evaluacion-notas',
    etapa: '2eso',
  },
  {
    ...nueva,
    slug: 'movil-en-clase-con-otro-profesor',
    publicada: '2026-09-22T16:10',
    titulo: 'El móvil está prohibido en todo el centro, pero se usa cuando hay otro profesor',
    extracto:
      'Nuestros hijos nos cuentan que en las horas con un profesor de apoyo o de guardia se usa el móvil y no se trabaja.',
    cuerpo: [
      'En el instituto el móvil está prohibido desde que entras hasta que sales, y son muy estrictos con ello. El director lo comunicó a las familias por circular al empezar el curso: no se pueden usar móviles, tabletas ni otros dispositivos propios en el recinto durante el horario escolar.',
      'Sin embargo, nuestros hijos nos cuentan a menudo que en las clases con un profesor de apoyo o de guardia sí se usa el móvil. Esas horas, en lugar de aprovecharse para avanzar o repasar, se pierden.',
      'El reglamento del propio centro dice que, en las guardias, el profesor debe asegurarse de que los alumnos hacen las actividades previstas o estudian (Reglamento de Régimen Interior, art. 22.d).',
      '¿Qué pasa en la clase de tu hijo o hija cuando no está su profesor habitual? Si te suena, pulsa «A mí también».',
    ],
    categoria: 'movil',
    etapa: 'eso',
  },
  {
    ...nueva,
    slug: 'google-workspace-cada-profesor-a-su-manera',
    publicada: '2026-09-22T16:20',
    titulo: 'Google Workspace: cada profesor lo usa a su manera y no hay forma de saber qué está pendiente',
    extracto:
      'Unos profesores lo publican todo, otros algo y otros nada. Cuando buscas qué tareas quedan, no sabes si no hay o si no se han publicado.',
    cuerpo: [
      'El centro usa Google Workspace para las clases. En la práctica, cada profesor lo usa de una manera: algunos no publican nada, otros publican cosas poco relevantes y otros lo tienen todo ahí.',
      'Cuando intentas revisar con tu hijo o hija qué tiene pendiente, es casi imposible. Si no aparece nada, no sabes si es que no hay tareas, si no se han publicado todavía, si no se van a publicar o si ese profesor no usa la plataforma.',
      'Una herramienta así solo sirve si todos la usan con un mínimo común. ¿Hay algún criterio del centro sobre qué se publica y dónde? Si a ti también te pasa, pulsa «A mí también».',
    ],
    categoria: 'comunicacion',
    etapa: 'eso',
  },
  {
    ...nueva,
    slug: 'ejercicios-de-computacion-e-ia',
    titulo: 'Ejercicios de Computación que parecen de universidad: ¿cómo se sabe que los hacen ellos?',
    extracto:
      'Los ejercicios nos parecen de una carrera técnica. Se hacen en el ordenador y, según nos cuentan, muchos se resuelven con inteligencia artificial.',
    cuerpo: [
      'En Computación, algunos de los ejercicios que se mandan nos parecen propios de una carrera técnica, no de alumnos de 13 años.',
      'Según nos cuenta nuestra hija, se hacen en el ordenador y muchos alumnos los resuelven con ChatGPT: copian el enunciado, pegan la respuesta y la entregan.',
      'No lo contamos para culpar a los alumnos, que usan lo que tienen a mano. Nos preguntamos qué se está evaluando: si el alumno entiende el ejercicio o si sabe usar una herramienta. ¿Se comprueba de alguna forma que el trabajo es suyo?',
      'Si has visto algo parecido en esta u otra materia, pulsa «A mí también».',
    ],
    categoria: 'evaluacion-notas',
    etapa: '2eso',
  },
  {
    ...nueva,
    slug: 'adaptaciones-que-no-llegan-a-los-examenes',
    titulo: 'Adaptaciones reconocidas que no llegan a los exámenes',
    extracto:
      'Nuestra hija tiene adaptaciones para los exámenes, pero nos cuenta que muchas veces no se aplican. A veces le quitan ejercicios en lugar de darle más tiempo.',
    cuerpo: [
      'Nuestra hija tiene adaptaciones reconocidas por el centro para los exámenes. El centro nos confirmó por escrito que los exámenes de recuperación estarían adaptados, fuera quien fuera el profesor.',
      'Según nos ha contado ella varias veces, en muchos exámenes no se aplican: no hay espacio suficiente para responder y no se le da más tiempo. A veces, en lugar de darle más tiempo, le quitan ejercicios.',
      'Quitar ejercicios no es lo mismo que dar más tiempo. Si en un examen se puede elegir, con menos ejercicios hay menos opciones de escoger los que mejor se saben, y menos posibilidades de aprobar.',
      'Es lo que nos cuenta nuestra hija; todavía no lo hemos podido comprobar examen por examen. Por eso preguntamos: si tu hijo o hija tiene adaptaciones, ¿se aplican en sus exámenes?',
    ],
    categoria: 'diversidad',
    etapa: '2eso',
  },
  {
    ...nueva,
    slug: 'pagar-un-portatil-por-ser-el-ultimo-usuario',
    titulo: 'Nos hicieron pagar la pantalla de un portátil del centro por ser la última en usarlo',
    extracto:
      'Nuestra hija avisó de que el portátil fallaba y pidió cambiarlo. Días después apareció con la pantalla rota y nos pasaron la factura.',
    cuerpo: [
      'El centro presta portátiles para usarlos en clase. Un día, nuestra hija notó que el suyo fallaba, se lo dijo a la profesora y pidió cambiarlo por otro. No la dejaron. Ese día nadie vio ni comunicó que la pantalla estuviera rota.',
      'Días después, el centro encontró el portátil con la pantalla rota. Como el registro de uso decía que ella había sido la última en usarlo, nos pasaron la reparación: más de 100 €. Solo recibimos el presupuesto; ningún informe sobre cómo ni cuándo se rompió.',
      'Pagamos, y después lo reclamamos por escrito al centro. Seguimos esperando respuesta.',
      'Ser el último en usar un equipo no demuestra quién lo rompió, ni cuándo, ni cómo. Y si un alumno avisa de un fallo, lo lógico es anotarlo y cambiar el equipo. ¿Os ha pasado algo parecido? ¿Qué pruebas os dieron?',
    ],
    categoria: 'otros',
    etapa: '2eso',
  },
  {
    ...nueva,
    slug: 'una-semana-entre-finales-y-recuperaciones',
    titulo: 'Una semana entre los exámenes finales y los de recuperación: ¿da tiempo?',
    extracto:
      'En junio, las recuperaciones empiezan la semana siguiente a los finales. ¿Se puede recuperar en una semana lo que no salió en todo el curso?',
    cuerpo: [
      'En junio, los exámenes de recuperación empiezan la semana siguiente a los exámenes finales.',
      'Quien ha suspendido, o se ha quedado cerca del aprobado, tiene una sola semana para preparar otra vez una o varias materias. Nos parece muy difícil que en ese tiempo pueda recuperar lo que no consiguió durante el curso.',
      '¿Qué sentido tienen esas pruebas si casi no hay tiempo para prepararlas? ¿Se podrían organizar de otra forma? Si tu hijo o hija ha pasado por ello, cuéntanos cómo fue.',
    ],
    categoria: 'evaluacion-notas',
    etapa: 'eso',
  },
  {
    ...nueva,
    slug: 'repetir-curso-con-mas-de-un-4',
    titulo: '¿Repetir curso con más de un 4?',
    extracto:
      'Otra familia nos cuenta que su hijo ha repetido con más de un 4 en una asignatura. ¿Se agotaron antes todos los apoyos?',
    cuerpo: [
      'Otra familia nos ha contado que su hijo ha repetido curso con más de un 4 en una asignatura. Sienten que es injusto.',
      'La norma dice que repetir es una medida excepcional, que se toma después de haber agotado las medidas ordinarias de refuerzo y apoyo ([Real Decreto 217/2022, art. 16.5](https://www.boe.es/buscar/act.php?id=BOE-A-2022-4975)). Y que se promociona con una o dos materias suspensas (Orden 1712/2023 de la Comunidad de Madrid, art. 26.1).',
      'Ya hay un primer dato: [cuántos alumnos pasan de curso en 1.º y 2.º de ESO](/datos#promocion-eso). En 2.º de ESO, la promoción bajó del 95 % en 2024-25 al 88 % en 2025-26. Aun así, sigue por encima de la media de los centros públicos de la Comunidad de Madrid (84,1 % en 2023-24, el último dato publicado). Fuente: [recopilación estadística del propio centro, pág. 27](/documentos/F008_recopilacion_estadistica_2eso_2025-26.pdf#page=27).',
      'Estamos intentando conseguir más estadísticas del centro, por ejemplo cuántos repiten y con cuántas materias suspensas, para poder documentar este caso. Cuando las tengamos, las publicaremos en la sección Datos, con su fuente.',
      'Queremos saber si es un caso aislado. Si en tu familia se ha decidido una repetición con notas cercanas al aprobado, pulsa «A mí también».',
    ],
    categoria: 'evaluacion-notas',
    etapa: 'eso',
  },
];
