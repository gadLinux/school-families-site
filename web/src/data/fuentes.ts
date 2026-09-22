/**
 * Fuentes citadas en /datos. Los códigos Fxxx coinciden con el registro de
 * datos de la investigación, para poder seguir cada cifra hasta su original.
 */
export interface Fuente {
  id: string;
  titulo: string;
  autor: string;
  /** Enlace público al original. Sin URL = documento no publicado en internet. */
  url?: string;
  fecha: string;
  consultada?: string;
  nota?: string;
}

export const fuentes = {
  F002: {
    id: 'F002',
    titulo: 'Resultados académicos: 2.º Bachillerato, titulación, notas medias y PAU',
    autor: 'IES Diego Velázquez',
    url: 'https://site.educa.madrid.org/ies.velazquez.torrelodones/wp-content/uploads/ies.velazquez.torrelodones/2026/03/02-Resultados-2-Bach-y-EVAU.pdf',
    fecha: 'marzo de 2026',
    consultada: '10/07/2026',
  },
  F003: {
    id: 'F003',
    titulo: 'Cartel «Resultados PAU 2026»',
    autor: 'IES Diego Velázquez',
    url: 'https://site.educa.madrid.org/ies.velazquez.torrelodones/wp-content/uploads/ies.velazquez.torrelodones/2026/06/Resultados-PAU-2026_page-0001.jpg',
    fecha: 'junio de 2026',
    consultada: '10/07/2026',
  },
  F008: {
    id: 'F008',
    titulo: 'Recopilación estadística de 2.º ESO, curso 2025-2026',
    autor: 'IES Diego Velázquez (dirección)',
    fecha: '17/07/2026',
    url: '/documentos/F008_recopilacion_estadistica_2eso_2025-26.pdf',
    nota: 'Documento que el centro entregó a la familia (PDF de 27 páginas, solo datos agregados por grupo). Lo publicamos aquí porque no está en internet.',
  },
  F009: {
    id: 'F009',
    titulo: 'Presentación de resultados PAU 2026',
    autor: 'Comunidad de Madrid, D. G. de Universidades, y universidades públicas de Madrid',
    url: 'https://www.comunidad.madrid/docs/2026-06/presentacion-resultados-pau-2026_vd.pdf?VersionId=YZRTi4DMYdXw5a4lwBLMwbXQtZS2Zg.X',
    fecha: 'junio de 2026',
    consultada: '22/09/2026',
  },
  F011: {
    id: 'F011',
    titulo: 'Buscador de centros educativos: ficha del IES Diego Velázquez (pestaña «Resultados académicos»)',
    autor: 'Comunidad de Madrid, Consejería de Educación',
    url: 'https://gestiona.comunidad.madrid/wpad_pub/run/j/MostrarFichaCentro.icm?cdCentro=28037089',
    fecha: 'consulta en línea',
    consultada: '22/09/2026',
  },
  RD534: {
    id: 'RD 534/2024',
    titulo: 'Real Decreto 534/2024, requisitos de acceso a las enseñanzas universitarias oficiales de Grado',
    autor: 'Boletín Oficial del Estado',
    url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2024-11858',
    fecha: 'texto consolidado',
    nota: 'Art. 10.1: solo pueden presentarse a la PAU quienes tengan el título de Bachiller.',
  },
} satisfies Record<string, Fuente>;

export type FuenteId = keyof typeof fuentes;

/** Una cita concreta: qué fuente y en qué página está la cifra. */
export interface Cita {
  fuente: FuenteId;
  pagina?: string;
  dato?: string;
}
